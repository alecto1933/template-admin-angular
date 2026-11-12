import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiIcon],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly theme = inject(ThemeService);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['raka@alecto.id', [Validators.required]],
    password: ['alecto123', [Validators.required, Validators.minLength(6)]],
  });

  protected invalid(control: 'username' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected forgotUsername(): void {
    this.toast.info('Lupa username', 'Hubungi admin untuk memulihkan username Anda.');
  }

  protected forgotPassword(): void {
    this.toast.info('Lupa kata sandi', 'Hubungkan tautan ini ke alur reset password Anda.');
  }

  protected register(): void {
    this.toast.info('Registrasi vendor', 'Hubungi admin untuk mendaftar sebagai vendor.');
  }

  protected submit(): void {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.toast.success(
        'Selamat datang kembali',
        'Login demo berhasil — mengarahkan ke dashboard.',
      );
      this.router.navigate(['/dashboard']);
    }, 900);
  }
}
