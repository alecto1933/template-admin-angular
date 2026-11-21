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
import { formatRupiah } from '../../core/format';
import { ORDER_STATUS, Order, OrderStatus } from '../../core/mock-data';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ORDERS_PAGE_SIZE, OrdersStore } from './orders.store';

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
  private readonly store = inject(OrdersStore);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly newOrderDialog = viewChild.required<UiDialog>('newOrderDialog');

  protected readonly orders = this.store.orders;
  protected readonly search = this.store.search;
  protected readonly statusFilter = this.store.statusFilter;
  protected readonly sortKey = this.store.sortKey;
  protected readonly sortDirection = this.store.sortDirection;
  protected readonly filtered = this.store.filtered;
  protected readonly paged = this.store.paged;
  protected readonly totalPages = this.store.pageCount;
  protected readonly currentPage = this.store.currentPage;

  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly menuOrder = signal<Order | null>(null);

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

  protected readonly rangeStart = computed(() =>
    this.filtered().length === 0 ? 0 : (this.currentPage() - 1) * ORDERS_PAGE_SIZE + 1,
  );

  protected readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * ORDERS_PAGE_SIZE, this.filtered().length),
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
    void this.store.load();

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.store.setSearch(params.get('q') ?? '');
    });
  }

  protected onSearch(event: Event): void {
    this.store.setSearch((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.store.setStatus((event.target as HTMLSelectElement).value as 'all' | OrderStatus);
  }

  protected resetFilters(): void {
    this.store.resetFilters();
  }

  protected sortBy(key: SortKey): void {
    this.store.setSort(key);
  }

  protected sortIcon(key: SortKey): IconName {
    if (this.sortKey() !== key) {
      return 'arrow-up-down';
    }
    return this.sortDirection() === 'asc' ? 'chevron-up' : 'chevron-down';
  }

  protected goToPage(page: number): void {
    this.store.setPage(page);
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
    const order = this.store.create({
      customer: value.customer,
      email: value.email,
      total: value.total,
      status: value.status,
    });

    this.newOrderDialog().close();
    this.toast.success('Pesanan ditambahkan', `${order.id} · ${order.customer}`);
  }

  protected deleteOrder(order: Order): void {
    this.store.remove(order.id);
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
    ids.forEach((id) => this.store.remove(id));
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
