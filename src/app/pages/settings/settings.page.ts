import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';
import { UiTab, UiTabs } from '../../shared/ui/tabs/tabs';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiPageHeader, UiButton, UiBadge, UiIcon, UiSwitch, UiTabs, UiTab],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private readonly toast = inject(ToastService);

  protected readonly orderUpdates = signal(true);
  protected readonly stockAlerts = signal(true);
  protected readonly reviewAlerts = signal(false);
  protected readonly marketingEmails = signal(false);
  protected readonly twoFactor = signal(true);

  protected readonly invoices = [
    { id: 'INV-2026-011', date: '1 Nov 2026', amount: 'Rp 249.000', status: 'Lunas' },
    { id: 'INV-2026-010', date: '1 Okt 2026', amount: 'Rp 249.000', status: 'Lunas' },
    { id: 'INV-2026-009', date: '1 Sep 2026', amount: 'Rp 249.000', status: 'Lunas' },
  ];

  protected readonly sessions = [
    {
      device: 'MacBook Pro · Chrome',
      location: 'Jakarta, Indonesia',
      time: 'Sesi saat ini',
      icon: 'laptop' as const,
      current: true,
    },
    {
      device: 'iPhone 15 · Safari',
      location: 'Jakarta, Indonesia',
      time: 'Terakhir aktif 2 jam lalu',
      icon: 'globe' as const,
      current: false,
    },
    {
      device: 'Windows 11 · Edge',
      location: 'Bandung, Indonesia',
      time: 'Terakhir aktif 3 hari lalu',
      icon: 'laptop' as const,
      current: false,
    },
  ];

  protected save(section: string): void {
    this.toast.success(`${section} disimpan`, 'Perubahan contoh berhasil diterapkan.');
  }

  protected saveAll(): void {
    this.toast.success(
      'Pengaturan disimpan',
      'Semua perubahan pengaturan berhasil disimpan (demo).',
    );
  }

  protected revokeSession(device: string): void {
    this.toast.success('Sesi dicabut', `${device} telah dikeluarkan.`);
  }

  protected upgrade(): void {
    this.toast.info('Upgrade paket', 'Halaman pembayaran belum disertakan.');
  }
}
