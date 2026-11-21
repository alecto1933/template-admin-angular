import { computed, Injectable, signal } from '@angular/core';
import { formatDate } from '../../core/format';
import { AVATAR_CLASSES, ORDERS, Order, OrderStatus } from '../../core/mock-data';

export type OrderSortKey = 'createdAt' | 'total';
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export const ORDERS_PAGE_SIZE = 6;

const FIRST_INVOICE = 2050;

export interface NewOrderInput {
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly _orders = signal<Order[]>([]);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private readonly _search = signal('');
  private readonly _statusFilter = signal<'all' | OrderStatus>('all');
  private readonly _sortKey = signal<OrderSortKey>('createdAt');
  private readonly _sortDirection = signal<'asc' | 'desc'>('desc');
  private readonly _page = signal(1);
  private nextInvoice = FIRST_INVOICE;

  readonly orders = this._orders.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly sortKey = this._sortKey.asReadonly();
  readonly sortDirection = this._sortDirection.asReadonly();

  readonly filtered = computed(() => {
    const query = this._search().trim().toLowerCase();
    const status = this._statusFilter();
    const key = this._sortKey();
    const direction = this._sortDirection() === 'asc' ? 1 : -1;

    return this._orders()
      .filter((order) => status === 'all' || order.status === status)
      .filter(
        (order) =>
          !query ||
          [order.id, order.customer, order.email].some((value) =>
            value.toLowerCase().includes(query),
          ),
      )
      .sort((a, b) => {
        if (key === 'total') {
          return (a.total - b.total) * direction;
        }
        return a.createdAt.localeCompare(b.createdAt) * direction;
      });
  });

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / ORDERS_PAGE_SIZE)),
  );

  readonly currentPage = computed(() => Math.min(this._page(), this.pageCount()));

  readonly paged = computed(() => {
    const page = this.currentPage();
    return this.filtered().slice((page - 1) * ORDERS_PAGE_SIZE, page * ORDERS_PAGE_SIZE);
  });

  async load(): Promise<void> {
    if (this._status() === 'loading' || this._status() === 'ready') {
      return;
    }
    this._status.set('loading');
    this._error.set(null);
    try {
      this._orders.set(await this.fetchOrders());
      this._status.set('ready');
    } catch {
      this._status.set('error');
      this._error.set('Gagal memuat pesanan.');
    }
  }

  async refresh(): Promise<void> {
    this._status.set('idle');
    await this.load();
  }

  setSearch(value: string): void {
    this._search.set(value);
    this._page.set(1);
  }

  setStatus(value: 'all' | OrderStatus): void {
    this._statusFilter.set(value);
    this._page.set(1);
  }

  setSort(key: OrderSortKey): void {
    if (this._sortKey() === key) {
      this._sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this._sortKey.set(key);
      this._sortDirection.set('desc');
    }
    this._page.set(1);
  }

  setPage(page: number): void {
    this._page.set(Math.min(Math.max(1, page), this.pageCount()));
  }

  resetFilters(): void {
    this._search.set('');
    this._statusFilter.set('all');
    this._page.set(1);
  }

  create(input: NewOrderInput): Order {
    const initials = input.customer
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    const order: Order = {
      id: `INV-${this.nextInvoice++}`,
      customer: input.customer.trim(),
      email: input.email.trim(),
      initials: initials || 'NA',
      avatarClass: AVATAR_CLASSES[this._orders().length % AVATAR_CLASSES.length],
      status: input.status,
      total: input.total,
      items: 1,
      date: formatDate(new Date()),
      createdAt: new Date().toISOString(),
    };

    this._orders.update((orders) => [order, ...orders]);
    this._page.set(1);
    return order;
  }

  remove(id: string): void {
    this._orders.update((orders) => orders.filter((order) => order.id !== id));
  }

  protected async fetchOrders(): Promise<Order[]> {
    return [...ORDERS];
  }
}
