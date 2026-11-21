import { Order, ORDER_STATUS, ORDERS } from '../../core/mock-data';
import { OrdersStore } from './orders.store';

describe('OrdersStore', () => {
  let store: OrdersStore;

  beforeEach(() => {
    store = new OrdersStore();
  });

  it('loads mock orders', async () => {
    await store.load();

    expect(store.status()).toBe('ready');
    expect(store.orders().length).toBe(ORDERS.length);
  });

  it('filters by search term', async () => {
    await store.load();

    store.setSearch('dewi');

    expect(store.filtered().map((order) => order.customer)).toEqual(['Dewi Lestari']);
    expect(store.currentPage()).toBe(1);
  });

  it('filters by status', async () => {
    await store.load();

    store.setStatus('paid');

    expect(store.filtered().length).toBeGreaterThan(0);
    expect(store.filtered().every((order) => order.status === 'paid')).toBe(true);
  });

  it('surfaces a load error', async () => {
    class FailingStore extends OrdersStore {
      protected override async fetchOrders(): Promise<Order[]> {
        throw new Error('boom');
      }
    }

    const failing = new FailingStore();
    await failing.load();

    expect(failing.status()).toBe('error');
    expect(failing.error()).not.toBeNull();
  });

  it('sorts by total and toggles direction', async () => {
    await store.load();

    store.setSort('total');
    const descending = store.filtered().map((order) => order.total);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));

    store.setSort('total');
    const ascending = store.filtered().map((order) => order.total);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
  });

  it('paginates filtered results', async () => {
    await store.load();

    expect(store.pageCount()).toBe(Math.ceil(ORDERS.length / 6));
    expect(store.paged().length).toBe(Math.min(6, ORDERS.length));
  });

  it('creates an order at the top of the list', async () => {
    await store.load();

    const order = store.create({
      customer: 'Budi Santoso',
      email: 'budi@mail.com',
      total: 125000,
      status: 'pending',
    });

    expect(store.orders()[0]).toBe(order);
    expect(order.initials).toBe('BS');
    expect(ORDER_STATUS[order.status].label).toBe('Menunggu');
    expect(store.currentPage()).toBe(1);
  });

  it('removes an order by id', async () => {
    await store.load();
    const target = store.orders()[0];

    store.remove(target.id);

    expect(store.orders().some((order) => order.id === target.id)).toBe(false);
  });

  it('resets filters', async () => {
    await store.load();
    store.setSearch('dewi');
    store.setStatus('paid');

    store.resetFilters();

    expect(store.search()).toBe('');
    expect(store.statusFilter()).toBe('all');
    expect(store.currentPage()).toBe(1);
  });
});
