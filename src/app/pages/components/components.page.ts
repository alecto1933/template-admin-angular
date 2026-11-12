import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';
import { UiTab, UiTabs } from '../../shared/ui/tabs/tabs';
import { ToastService, ToastVariant } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-components',
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
    UiSwitch,
    UiDialog,
    UiTabs,
    UiTab,
  ],
  templateUrl: './components.page.html',
})
export class ComponentsPage {
  private readonly toast = inject(ToastService);
  protected readonly demoDialog = viewChild.required<UiDialog>('demoDialog');

  protected readonly emailNotifications = signal(true);
  protected readonly twoFactor = signal(false);
  protected readonly loading = signal(false);
  protected readonly progressValue = 68;

  protected readonly swatches = [
    { name: 'Primary', classes: 'bg-primary' },
    { name: 'Success', classes: 'bg-success' },
    { name: 'Warning', classes: 'bg-warning' },
    { name: 'Destructive', classes: 'bg-destructive' },
    { name: 'Chart 2', classes: 'bg-chart-2' },
    { name: 'Chart 3', classes: 'bg-chart-3' },
    { name: 'Chart 4', classes: 'bg-chart-4' },
    { name: 'Muted', classes: 'bg-muted' },
  ];

  protected simulateLoading(): void {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.toast.success('Selesai', 'Aksi simulasi berhasil dijalankan.');
    }, 1400);
  }

  protected openDialog(): void {
    this.demoDialog().open();
  }

  protected confirmDialog(): void {
    this.demoDialog().close();
    this.toast.success('Disimpan', 'Perubahan contoh berhasil disimpan.');
  }

  protected showToast(variant: ToastVariant): void {
    this.toast.show({
      title: {
        success: 'Berhasil!',
        error: 'Terjadi kesalahan',
        warning: 'Perlu perhatian',
        info: 'Informasi',
      }[variant],
      description: 'Toast bisa dipakai untuk konfirmasi aksi, error, atau pengingat.',
      variant,
    });
  }

  protected menuAction(label: string): void {
    this.toast.info(label, 'Item menu contoh dijalankan.');
  }
}
