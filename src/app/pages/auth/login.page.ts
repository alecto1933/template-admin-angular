import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiIcon],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly theme = inject(ThemeService);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['raka@alecto.id', [Validators.required, Validators.email]],
    password: ['alecto123', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  protected invalid(control: 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected forgotPassword(): void {
    this.toast.info('Lupa kata sandi', 'Hubungkan tautan ini ke alur reset password Anda.');
  }

  protected useDemoAccount(): void {
    this.form.setValue({
      email: 'raka@alecto.id',
      password: 'alecto123',
      remember: true,
    });
    this.toast.info('Akun demo siap', 'Tekan “Masuk” untuk melanjutkan.');
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
