import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiPageHeader, UiButton, UiBadge, UiIcon, UiSwitch, UiDialog],
  templateUrl: './forms.page.html',
})
export class FormsPage {
  private readonly toast = inject(ToastService);
  protected readonly deleteDialog = viewChild.required(UiDialog);

  protected readonly emailNotifications = signal(true);
  protected readonly pushNotifications = signal(false);
  protected readonly weeklyDigest = signal(true);
  protected readonly productUpdates = signal(false);

  protected readonly bioLength = signal(118);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    firstName: ['Raka', [Validators.required, Validators.minLength(2)]],
    lastName: ['Pratama', [Validators.required, Validators.minLength(2)]],
    email: ['raka@alecto.id', [Validators.required, Validators.email]],
    phone: ['+62 812 3456 7890'],
    role: ['admin'],
    timezone: ['Asia/Jakarta (WIB)'],
    bio: ['Membangun pengalaman belanja yang sederhana dan menyenangkan untuk pelanggan iVendor Superapps.'],
  });

  protected invalid(control: 'firstName' | 'lastName' | 'email'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected onBioInput(event: Event): void {
    this.bioLength.set((event.target as HTMLTextAreaElement).value.length);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Periksa kembali form', 'Beberapa kolom wajib belum diisi dengan benar.');
      return;
    }

    this.form.markAsPristine();
    this.toast.success('Profil disimpan', 'Perubahan profil berhasil disimpan (demo).');
  }

  protected saveDraft(): void {
    this.toast.info('Draf tersimpan', 'Draf profil disimpan secara lokal.');
  }

  protected resetForm(): void {
    this.form.reset({
      firstName: 'Raka',
      lastName: 'Pratama',
      email: 'raka@alecto.id',
      phone: '+62 812 3456 7890',
      role: 'admin',
      timezone: 'Asia/Jakarta (WIB)',
      bio: 'Membangun pengalaman belanja yang sederhana dan menyenangkan untuk pelanggan iVendor Superapps.',
    });
    this.bioLength.set(this.form.controls.bio.value.length);
    this.toast.info('Form direset', 'Semua perubahan yang belum disimpan dibuang.');
  }

  protected changePhoto(): void {
    this.toast.info('Ganti foto', 'Hubungkan tombol ini ke uploader gambar favorit Anda.');
  }

  protected removePhoto(): void {
    this.toast.warning(
      'Foto dihapus',
      'Avatar inisial akan ditampilkan sampai foto baru diunggah.',
    );
  }

  protected saveNotifications(): void {
    this.toast.success('Preferensi disimpan', 'Pengaturan notifikasi berhasil diperbarui.');
  }

  protected deleteAccount(): void {
    this.deleteDialog()?.close();
    this.toast.success('Permintaan diterima', 'Ini demo — akun tidak benar-benar dihapus.');
  }
}
