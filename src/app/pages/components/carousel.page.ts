import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiCarousel } from '../../shared/ui/carousel/carousel';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

interface DemoSlide {
  title: string;
  text: string;
  icon: IconName;
  tone: string;
}

@Component({
  selector: 'app-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiCarousel],
  templateUrl: './carousel.page.html',
})
export class CarouselPage {
  protected readonly slides: DemoSlide[] = [
    {
      title: 'Ringkasan penjualan',
      text: 'Pantau performa harian dan tren pendapatan.',
      icon: 'chart-column',
      tone: 'bg-primary-soft text-primary',
    },
    {
      title: 'Pesanan baru',
      text: 'Kelola transaksi yang masuk secara real-time.',
      icon: 'shopping-cart',
      tone: 'bg-success-soft text-success',
    },
    {
      title: 'Stok produk',
      text: 'Ketahui produk yang perlu segera di-restock.',
      icon: 'package',
      tone: 'bg-warning-soft text-warning',
    },
    {
      title: 'Pelanggan',
      text: 'Lihat pelanggan baru dan aktivitas terbaru.',
      icon: 'users',
      tone: 'bg-chart-2/15 text-chart-2',
    },
    {
      title: 'Laporan',
      text: 'Unduh laporan mingguan dan bulanan.',
      icon: 'file-text',
      tone: 'bg-destructive-soft text-destructive',
    },
  ];
}
