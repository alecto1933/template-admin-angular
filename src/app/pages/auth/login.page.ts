import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

type Language = 'id' | 'en';

const TEXTS = {
  id: {
    title: 'SISTEM MANAJEMEN VENDOR',
    subtitle: 'Silakan masuk ke akun Anda',
    usernameLabel: 'Username',
    forgotUsername: 'Lupa username?',
    passwordLabel: 'Kata sandi',
    forgotPassword: 'Lupa kata sandi?',
    usernameRequired: 'Username wajib diisi.',
    passwordMin: 'Kata sandi minimal 6 karakter.',
    submit: 'Masuk',
    submitting: 'Memproses...',
    vendorPrompt: 'Ingin menjadi vendor kami?',
    register: 'Daftar di sini',
    themeLight: 'Aktifkan mode terang',
    themeDark: 'Aktifkan mode gelap',
    forgotUsernameTitle: 'Lupa username',
    forgotUsernameMessage: 'Hubungi admin untuk memulihkan username Anda.',
    forgotPasswordTitle: 'Lupa kata sandi',
    forgotPasswordMessage: 'Hubungkan tautan ini ke alur reset password Anda.',
    registerTitle: 'Registrasi vendor',
    registerMessage: 'Hubungi admin untuk mendaftar sebagai vendor.',
    welcomeTitle: 'Selamat datang kembali',
    welcomeMessage: 'Login berhasil — mengarahkan ke dashboard.',
  },
  en: {
    title: 'VENDOR MANAGEMENT SYSTEM',
    subtitle: 'Please sign in to your account',
    usernameLabel: 'Username',
    forgotUsername: 'Forgot username?',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    usernameRequired: 'Username is required.',
    passwordMin: 'Password must be at least 6 characters.',
    submit: 'Sign in',
    submitting: 'Signing in...',
    vendorPrompt: 'Do you want to be our vendor?',
    register: 'Register Here',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    forgotUsernameTitle: 'Forgot username',
    forgotUsernameMessage: 'Contact the admin to recover your username.',
    forgotPasswordTitle: 'Forgot password',
    forgotPasswordMessage: 'Connect this link to your password reset flow.',
    registerTitle: 'Vendor registration',
    registerMessage: 'Contact the admin to register as a vendor.',
    welcomeTitle: 'Welcome back',
    welcomeMessage: 'Signed in successfully — redirecting to the dashboard.',
  },
} as const;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiButton, UiIcon],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly theme = inject(ThemeService);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly lang = signal<Language>('id');
  protected readonly t = computed(() => TEXTS[this.lang()]);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['raka@alecto.id', [Validators.required]],
    password: ['alecto123', [Validators.required, Validators.minLength(6)]],
  });

  protected invalid(control: 'username' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected setLang(language: Language): void {
    this.lang.set(language);
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected forgotUsername(): void {
    this.toast.info(this.t().forgotUsernameTitle, this.t().forgotUsernameMessage);
  }

  protected forgotPassword(): void {
    this.toast.info(this.t().forgotPasswordTitle, this.t().forgotPasswordMessage);
  }

  protected register(): void {
    this.toast.info(this.t().registerTitle, this.t().registerMessage);
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
      this.toast.success(this.t().welcomeTitle, this.t().welcomeMessage);
      this.router.navigate(['/dashboard']);
    }, 900);
  }
}
