import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { formatLongDate, formatRupiah } from '../../core/format';
import {
  ACTIVITIES,
  DASHBOARD_STATS,
  ORDER_STATUS,
  ORDERS,
  REVENUE_BY_PERIOD,
  RevenuePeriod,
  TRAFFIC_SEGMENTS,
} from '../../core/mock-data';
import { UiAreaChart } from '../../shared/ui/charts/area-chart';
import { UiDonutChart } from '../../shared/ui/charts/donut-chart';
import { UiSparkline } from '../../shared/ui/charts/sparkline';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiPageHeader, UiButton, UiBadge, UiIcon, UiAreaChart, UiDonutChart, UiSparkline],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  protected readonly stats = DASHBOARD_STATS;
  protected readonly traffic = TRAFFIC_SEGMENTS;
  protected readonly activities = ACTIVITIES;
  protected readonly statusMeta = ORDER_STATUS;
  protected readonly recentOrders = ORDERS.slice(0, 5);
  protected readonly today = formatLongDate();
  protected readonly formatRupiah = formatRupiah;

  protected readonly period = signal<RevenuePeriod>('30d');
  protected readonly revenue = computed(() => REVENUE_BY_PERIOD[this.period()]);

  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected onPeriodChange(event: Event): void {
    this.period.set((event.target as HTMLSelectElement).value as RevenuePeriod);
  }

  protected downloadReport(): void {
    this.toast.success(
      'Laporan disiapkan',
      'Ini demo — hubungkan tombol unduh ke endpoint laporan Anda.',
    );
  }

  protected goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
