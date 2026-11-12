import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { formatDate, formatRupiah } from '../../core/format';
import { AVATAR_CLASSES, ORDER_STATUS, ORDERS, Order, OrderStatus } from '../../core/mock-data';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

type SortKey = 'createdAt' | 'total';

@Component({
  selector: 'app-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiPageHeader,
    UiButton,
    UiBadge,
    UiIcon,
    UiDialog,
  ],
  templateUrl: './orders.page.html',
})
export class OrdersPage {
  protected readonly orders = signal<Order[]>(ORDERS);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<'all' | OrderStatus>('all');
  protected readonly sortKey = signal<SortKey>('createdAt');
  protected readonly sortDirection = signal<'asc' | 'desc'>('desc');
  protected readonly page = signal(1);
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly menuOrder = signal<Order | null>(null);

  protected readonly pageSize = 6;
  protected readonly statusMeta = ORDER_STATUS;
  protected readonly formatRupiah = formatRupiah;
  protected readonly statusOptions = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => ({
    value,
    ...ORDER_STATUS[value],
  }));

  protected readonly form = inject(FormBuilder).nonNullable.group({
    customer: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    total: [0, [Validators.required, Validators.min(1)]],
    status: ['pending' as OrderStatus],
  });

  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly newOrderDialog = viewChild.required<UiDialog>('newOrderDialog');
  private nextInvoice = 2050;

  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const key = this.sortKey();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    return this.orders()
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

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly currentPage = computed(() => Math.min(this.page(), this.totalPages()));

  protected readonly paged = computed(() => {
    const page = this.currentPage();
    return this.filtered().slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  protected readonly rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.filtered().length),
  );

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    let start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected readonly selectedCount = computed(() => this.selected().size);

  protected readonly allOnPageSelected = computed(() => {
    const rows = this.paged();
    return rows.length > 0 && rows.every((row) => this.selected().has(row.id));
  });

  protected readonly hasFilters = computed(() => !!this.search() || this.statusFilter() !== 'all');

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const query = params.get('q');
      if (query !== null) {
        this.search.set(query);
        this.page.set(1);
      }
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | OrderStatus);
    this.page.set(1);
  }

  protected resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.page.set(1);
  }

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('desc');
    }
    this.page.set(1);
  }

  protected sortIcon(key: SortKey): IconName {
    if (this.sortKey() !== key) {
      return 'arrow-up-down';
    }
    return this.sortDirection() === 'asc' ? 'chevron-up' : 'chevron-down';
  }

  protected goToPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.totalPages()));
  }

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selected.set(next);
  }

  protected toggleAllOnPage(): void {
    const next = new Set(this.selected());
    if (this.allOnPageSelected()) {
      this.paged().forEach((row) => next.delete(row.id));
    } else {
      this.paged().forEach((row) => next.add(row.id));
    }
    this.selected.set(next);
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected openNewOrder(): void {
    this.form.reset({
      customer: '',
      email: '',
      total: 0,
      status: 'pending',
    });
    this.newOrderDialog().open();
  }

  protected invalid(control: 'customer' | 'email' | 'total'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected submitNewOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const initials = value.customer
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    const order: Order = {
      id: `INV-${this.nextInvoice++}`,
      customer: value.customer.trim(),
      email: value.email.trim(),
      initials: initials || 'NA',
      avatarClass: AVATAR_CLASSES[this.orders().length % AVATAR_CLASSES.length],
      status: value.status,
      total: value.total,
      items: 1,
      date: formatDate(new Date()),
      createdAt: new Date().toISOString(),
    };

    this.orders.update((orders) => [order, ...orders]);
    this.page.set(1);
    this.newOrderDialog().close();
    this.toast.success('Pesanan ditambahkan', `${order.id} · ${order.customer}`);
  }

  protected deleteOrder(order: Order): void {
    this.orders.update((orders) => orders.filter((item) => item.id !== order.id));
    this.selected.update((selected) => {
      const next = new Set(selected);
      next.delete(order.id);
      return next;
    });
    this.toast.success('Pesanan dihapus', `${order.id} telah dihapus dari daftar.`);
  }

  protected deleteSelected(): void {
    const ids = this.selected();
    if (!ids.size) {
      return;
    }
    this.orders.update((orders) => orders.filter((order) => !ids.has(order.id)));
    this.clearSelection();
    this.toast.success(`${ids.size} pesanan dihapus`, 'Data contoh hanya berubah di sesi ini.');
  }

  protected copyId(id: string): void {
    if (!navigator.clipboard) {
      this.toast.error('Gagal menyalin', 'Clipboard tidak tersedia.');
      return;
    }
    navigator.clipboard.writeText(id).then(
      () => this.toast.success('ID disalin', id),
      () => this.toast.error('Gagal menyalin', 'Periksa izin clipboard.'),
    );
  }

  protected viewOrder(order: Order): void {
    this.toast.info(
      `${order.id} · ${order.customer}`,
      `${order.items} item · ${formatRupiah(order.total)} · ${order.date}`,
    );
  }

  protected exportOrders(): void {
    this.toast.success('Ekspor dimulai', `${this.filtered().length} pesanan siap diekspor (demo).`);
  }
}
