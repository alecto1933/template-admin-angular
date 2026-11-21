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
import { SessionService } from '@/core/state/session.service';
import { ThemeService } from '@/core/theme/theme.service';
import { AutocompleteOption, UiAutocomplete } from '@/shared/ui/autocomplete/autocomplete';
import { UiButton } from '@/shared/ui/button/button';
import { UiIcon } from '@/shared/ui/icon/icon';
import { UiDialog } from '@/shared/ui/dialog/dialog';
import { UiTooltip } from '@/shared/ui/tooltip/tooltip';
import { TranslationService } from '@/core/i18n/translation.service';
import { LOGIN_TEXTS } from '@/core/i18n/login.texts';
import { LANGUAGES, languageInfo } from '@/core/i18n/language';
import { ToastService } from '@/shared/ui/toast/toast.service';

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
  private readonly session = inject(SessionService);

  protected readonly theme = inject(ThemeService);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  private readonly i18n = inject(TranslationService);

  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => LOGIN_TEXTS[this.lang()]);
  protected readonly languages = LANGUAGES;
  protected readonly languageInfo = languageInfo;

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

  protected setLang(language: (typeof LANGUAGES)[number]['code']): void {
    this.i18n.setLanguage(language);
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
    this.router.navigate(['/public/registration']);
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
      this.session.login();
      this.toast.success(this.t().welcomeTitle, this.t().welcomeMessage);
      this.router.navigate(['/home']);
    }, 900);
  }
}
