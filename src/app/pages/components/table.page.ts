import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatRupiah } from '../../core/format';
import { ORDER_STATUS, ORDERS, Order } from '../../core/mock-data';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiPageHeader,
    UiButton,
    UiBadge,
    UiIcon,
  ],
  templateUrl: './table.page.html',
})
export class TablePage {
  private readonly toast = inject(ToastService);

  protected readonly statusMeta = ORDER_STATUS;
  protected readonly formatRupiah = formatRupiah;
  protected readonly orders = signal(ORDERS);
  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 5;
  protected readonly menuOrder = signal<Order | null>(null);
  protected readonly min = Math.min;

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.orders().filter(
      (order) =>
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term),
    );
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  protected readonly paged = computed(() => {
    const page = Math.min(this.page(), this.totalPages());
    return this.filtered().slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  protected readonly totalAmount = computed(() =>
    this.paged().reduce((sum, order) => sum + order.total, 0),
  );

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected action(label: string): void {
    this.toast.info(label, 'Aksi tabel dijalankan (demo).');
  }
}
