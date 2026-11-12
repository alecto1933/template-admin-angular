import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/theme/theme.service';
import { AutocompleteOption, UiAutocomplete } from '../../shared/ui/autocomplete/autocomplete';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiTooltip } from '../../shared/ui/tooltip/tooltip';
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
    forgotDialogTitle: 'Lupa username',
    fieldName: 'Nama',
    fieldExistingUsername: 'Masukkan Username yang Sudah Ada',
    fieldIdentity: 'NPWP / NIK / KTP',
    fieldForgotIdentity: 'Jika lupa NPWP, centang di sini',
    fieldEmailUsername: 'Email yang mau dijadikan usernamenya',
    fieldEmailRegistered: 'Masukkan email terdaftar yang Anda gunakan sebagai Username',
    infoForgotEmail:
      'Jika Anda tidak ingat email yang terdaftar, silakan kembali ke beranda dan klik “Lupa Username”',
    alertResetPassword:
      'Setelah menekan tombol KIRIM, saya menyatakan dan memahami bahwa saya mengajukan reset kata sandi atas nama email terdaftar di atas. Tindakan yang sudah dilakukan tidak dapat dibatalkan.',
    notesTitle: '*) Catatan',
    note1: '1. Alamat email akan digunakan sebagai USERNAME',
    note2: '2. Untuk Perusahaan, jangan gunakan alamat email karyawan',
    note3: '3. 1 (Satu) alamat email hanya untuk 1 perusahaan atau 1 entitas',
    note4: '4. Alamat email terdaftar akan digunakan untuk komunikasi dan selalu aktif',
    sendRequest: 'Kirim',
    reportText:
      'Jika Anda mengetahui dan/atau memiliki informasi tentang segala bentuk kecurangan yang melibatkan karyawan kami, silakan gunakan platform Whistleblowing “LAPOR” ini untuk melaporkannya — Lapor AIO.',
    reportClick: 'klik saya!',
    reportCollapse: 'Perkecil informasi',
    reportExpand: 'Tampilkan informasi',
    shortcutAria: 'Menu pintasan',
    shortcutNews: 'Berita Terbaru',
    shortcutWebsite: 'Website Kami',
    shortcutCsr: 'CSR Kami',
    guideAria: 'Buka panduan',
    guideLabel: 'Panduan',
    placeholderName: 'Nama lengkap',
    nameEmptyText: 'Nama tidak ditemukan',
    nameHintText: 'Ketik untuk mencari nama…',
    placeholderExistingUsername: 'Username yang sudah ada (opsional)',
    placeholderIdentity: 'NPWP / NIK / KTP',
    placeholderEmail: 'nama@perusahaan.com',
    errorNameRequired: 'Nama wajib diisi.',
    errorIdentityRequired: 'NPWP / NIK / KTP wajib diisi.',
    errorEmailRequired: 'Masukkan email yang valid.',
    cancel: 'Batal',
    send: 'Kirim',
    requestSentTitle: 'Permintaan terkirim',
    requestSentMessage: 'Tim admin akan menghubungi Anda melalui email terdaftar.',
    passwordResetSentTitle: 'Permintaan reset terkirim',
    passwordResetSentMessage: 'Permintaan reset kata sandi telah dikirim ke email terdaftar.',
    confirmTitle: 'Konfirmasi',
    confirmUsernameMessage: 'Kirim permintaan pemulihan username?',
    confirmPasswordMessage: 'Kirim permintaan reset kata sandi?',
    themeLight: 'Aktifkan mode terang',
    themeDark: 'Aktifkan mode gelap',
    forgotUsernameTitle: 'Lupa username',
    forgotUsernameMessage: 'Hubungi admin untuk memulihkan username Anda.',
    forgotPasswordTitle: 'Lupa kata sandi',
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
    forgotDialogTitle: 'Forgot username',
    fieldName: 'Name',
    fieldExistingUsername: 'Insert Existing Username',
    fieldIdentity: 'NPWP / NIK / KTP',
    fieldForgotIdentity: 'If forgot NPWP, tick here',
    fieldEmailUsername: 'Email to use as your username',
    fieldEmailRegistered: 'Insert existing email that you Register as Username',
    infoForgotEmail:
      'If you don’t remember your registered email, please back to home and click “Forgot User”',
    alertResetPassword:
      'After click SUBMIT button, i acknowledge and understood that i request to reset password on behalf of registered email above. Any undo action can’t be undone.',
    notesTitle: '*) Notes',
    note1: '1. Email address will be use as USERNAME',
    note2: '2. For Company, please do not use employee email address',
    note3: '3. 1 (One) email address is only use for 1 company or 1 entity',
    note4: '4. Registered Email address will be used for communication and always active',
    sendRequest: 'Submit',
    reportText:
      'If you know and/or have information about any fraud involving our employees, please use this “LAPOR” Whistleblowing platform to report it — Lapor AIO.',
    reportClick: 'click me!',
    reportCollapse: 'Minimize information',
    reportExpand: 'Show information',
    shortcutAria: 'Shortcut menu',
    shortcutNews: 'News Update',
    shortcutWebsite: 'Our Website',
    shortcutCsr: 'Our CSR',
    guideAria: 'Open guide',
    guideLabel: 'Guide',
    placeholderName: 'Full name',
    nameEmptyText: 'No name found',
    nameHintText: 'Type to search for a name…',
    placeholderExistingUsername: 'Existing username (optional)',
    placeholderIdentity: 'NPWP / NIK / KTP',
    placeholderEmail: 'name@company.com',
    errorNameRequired: 'Name is required.',
    errorIdentityRequired: 'NPWP / NIK / KTP is required.',
    errorEmailRequired: 'Enter a valid email address.',
    cancel: 'Cancel',
    send: 'Send',
    requestSentTitle: 'Request sent',
    requestSentMessage: 'Our admin team will contact you via the registered email.',
    passwordResetSentTitle: 'Reset request sent',
    passwordResetSentMessage: 'The password reset request has been sent to the registered email.',
    confirmTitle: 'Confirmation',
    confirmUsernameMessage: 'Send the username recovery request?',
    confirmPasswordMessage: 'Send the password reset request?',
    themeLight: 'Switch to light mode',
    themeDark: 'Switch to dark mode',
    forgotUsernameTitle: 'Forgot username',
    forgotUsernameMessage: 'Contact the admin to recover your username.',
    forgotPasswordTitle: 'Forgot password',
    registerTitle: 'Vendor registration',
    registerMessage: 'Contact the admin to register as a vendor.',
    welcomeTitle: 'Welcome back',
    welcomeMessage: 'Signed in successfully — redirecting to the dashboard.',
  },
} as const;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiAutocomplete,
    UiButton,
    UiIcon,
    UiDialog,
    UiTooltip,
  ],
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

  protected readonly forgotUsernameForm = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required]],
    existingUsername: [''],
    identity: ['', [Validators.required]],
    forgotIdentity: [false],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly forgotPasswordForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly forgotDialog = viewChild.required<UiDialog>('forgotDialog');
  protected readonly forgotPasswordDialog = viewChild.required<UiDialog>('forgotPasswordDialog');
  protected readonly confirmDialog = viewChild.required<UiDialog>('confirmDialog');

  protected readonly pendingAction = signal<'username' | 'password' | null>(null);
  protected readonly reportExpanded = signal(true);
  protected readonly shortcutOpen = signal(false);
  protected readonly confirmMessage = computed(() =>
    this.pendingAction() === 'password'
      ? this.t().confirmPasswordMessage
      : this.t().confirmUsernameMessage,
  );

  protected readonly nameOptions = signal<AutocompleteOption[]>([]);
  protected readonly nameLoading = signal(false);
  protected readonly nameQuery = signal('');
  private nameSearchTimer?: ReturnType<typeof setTimeout>;

  private readonly mockNames: AutocompleteOption[] = [
    { value: 'Raka Pratama', label: 'Raka Pratama' },
    { value: 'Dewi Lestari', label: 'Dewi Lestari' },
    { value: 'Bagas Saputra', label: 'Bagas Saputra' },
    { value: 'Siti Nurhaliza', label: 'Siti Nurhaliza' },
    { value: 'Andi Wijaya', label: 'Andi Wijaya' },
    { value: 'Maya Sari', label: 'Maya Sari' },
    { value: 'Fajar Nugroho', label: 'Fajar Nugroho' },
    { value: 'Rina Kurniawati', label: 'Rina Kurniawati' },
  ];

  /** Mock async search: simulates a backend lookup for names. */
  protected searchNames(term: string): void {
    clearTimeout(this.nameSearchTimer);
    const query = term.trim();
    this.nameQuery.set(query);

    if (!query) {
      this.nameLoading.set(false);
      this.nameOptions.set([]);
      return;
    }

    this.nameLoading.set(true);
    this.nameSearchTimer = setTimeout(() => {
      const matches = this.mockNames.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      );
      this.nameOptions.set(matches);
      this.nameLoading.set(false);
    }, 400);
  }

  constructor() {
    this.forgotUsernameForm.controls.forgotIdentity.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((forgot) => {
        const identity = this.forgotUsernameForm.controls.identity;
        identity.setValidators(forgot ? [] : [Validators.required]);
        identity.updateValueAndValidity();
      });
  }

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

  protected fuInvalid(control: 'name' | 'identity' | 'email'): boolean {
    const field = this.forgotUsernameForm.controls[control];
    return field.invalid && (field.touched || field.dirty);
  }

  protected openForgotUsername(): void {
    this.forgotUsernameForm.reset();
    this.forgotDialog().open();
  }

  protected submitForgotUsername(): void {
    if (this.forgotUsernameForm.invalid) {
      this.forgotUsernameForm.markAllAsTouched();
      return;
    }

    this.openConfirm('username');
  }

  protected fpInvalid(): boolean {
    const field = this.forgotPasswordForm.controls.email;
    return field.invalid && (field.touched || field.dirty);
  }

  protected openForgotPassword(): void {
    this.forgotPasswordForm.reset();
    this.forgotPasswordDialog().open();
  }

  protected submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.openConfirm('password');
  }

  protected openConfirm(action: 'username' | 'password'): void {
    this.pendingAction.set(action);
    this.confirmDialog().open();
  }

  protected confirmRequest(): void {
    const action = this.pendingAction();
    this.confirmDialog().close();
    this.pendingAction.set(null);

    if (action === 'username') {
      this.forgotDialog().close();
      this.toast.success(this.t().requestSentTitle, this.t().requestSentMessage);
    } else if (action === 'password') {
      this.forgotPasswordDialog().close();
      this.toast.success(this.t().passwordResetSentTitle, this.t().passwordResetSentMessage);
    }
  }

  protected register(): void {
    this.router.navigate(['/auth/register']);
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
