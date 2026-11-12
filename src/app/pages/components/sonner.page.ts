import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastPosition, ToastService, ToastVariant } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-sonner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './sonner.page.html',
})
export class SonnerPage {
  protected readonly toastService = inject(ToastService);

  protected readonly positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  protected show(variant: ToastVariant): void {
    this.toastService.show({
      title: {
        success: 'Berhasil disimpan',
        error: 'Gagal menyimpan',
        warning: 'Perlu perhatian',
        info: 'Informasi baru',
      }[variant],
      description: 'Toast bisa digunakan untuk feedback singkat setelah aksi.',
      variant,
    });
  }

  protected showDescription(): void {
    this.toastService.success(
      'Pembayaran diterima',
      'Invoice #INV-2049 sebesar Rp 4.250.000 sudah lunas dan tercatat di sistem.',
    );
  }

  protected setPosition(position: ToastPosition): void {
    this.toastService.setPosition(position);
    this.toastService.info(
      'Posisi diubah',
      `Toast sekarang muncul di ${position.replace('-', ' ')}.`,
    );
  }
}
