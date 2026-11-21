import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessionService } from '@/core/state/session.service';
import { LanguageService } from '@/core/language.service';
import { ToastService } from '@/shared/ui/toast/toast.service';
import { LoginPage } from '@/pages/auth/login.page';

function host(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

async function openLanguageMenu(fixture: ComponentFixture<unknown>): Promise<void> {
  const trigger = host(fixture).querySelector<HTMLButtonElement>(
    'button[aria-label="Bahasa: Indonesia"]',
  );
  expect(trigger).not.toBeNull();
  trigger?.click();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function create(): { fixture: ComponentFixture<LoginPage>; c: any } {
  const fixture = TestBed.createComponent(LoginPage);
  fixture.detectChanges();
  return { fixture, c: fixture.componentInstance as any };
}

describe('LoginPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    HTMLDialogElement.prototype.showModal = vi.fn() as never;
    HTMLDialogElement.prototype.close = vi.fn() as never;

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('lists the three available languages and switches the copy', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    expect(host(fixture).textContent).toContain('SISTEM MANAJEMEN VENDOR');

    await openLanguageMenu(fixture);
    const labels = Array.from(document.querySelectorAll<HTMLButtonElement>('.ui-menu-item')).map(
      (button) => (button.textContent ?? '').trim(),
    );
    expect(labels.some((label) => label.includes('Indonesia'))).toBe(true);
    expect(labels.some((label) => label.includes('English'))).toBe(true);
    expect(labels.some((label) => label.includes('日本語'))).toBe(true);

    const english = Array.from(document.querySelectorAll<HTMLButtonElement>('.ui-menu-item')).find(
      (button) => (button.textContent ?? '').includes('English'),
    );
    english?.click();
    fixture.detectChanges();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(host(fixture).textContent).toContain('VENDOR MANAGEMENT SYSTEM');
    expect(localStorage.getItem('ivendor-language')).toBe('en');
  });

  it('marks username and password as invalid on an empty submit', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      form: { patchValue: (value: Record<string, string>) => void };
    };
    component.form.patchValue({ username: '', password: '' });
    fixture.detectChanges();

    host(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    fixture.detectChanges();

    const username = host(fixture).querySelector<HTMLInputElement>('#login-username');
    const password = host(fixture).querySelector<HTMLInputElement>('#login-password');
    expect(username?.getAttribute('aria-invalid')).toBe('true');
    expect(password?.getAttribute('aria-invalid')).toBe('true');
    expect(host(fixture).textContent).toContain('Username wajib diisi.');
    expect(host(fixture).textContent).toContain('Kata sandi minimal 6 karakter.');
  });

  it('signs in and navigates home with valid credentials', () => {
    const session = TestBed.inject(SessionService);
    const login = vi.spyOn(session, 'login');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    vi.useFakeTimers();
    host(fixture).querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    fixture.detectChanges();

    expect(host(fixture).textContent).toContain('Memproses...');

    vi.advanceTimersByTime(900);
    fixture.detectChanges();

    expect(login).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('toggles password visibility', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const password = host(fixture).querySelector<HTMLInputElement>('#login-password');
    expect(password?.type).toBe('password');

    const toggle = host(fixture).querySelector<HTMLButtonElement>(
      'button[aria-label="Tampilkan kata sandi"]',
    );
    expect(toggle).not.toBeNull();
    toggle?.click();
    fixture.detectChanges();

    expect(password?.type).toBe('text');
    expect(
      host(fixture).querySelector('button[aria-label="Sembunyikan kata sandi"]'),
    ).not.toBeNull();
  });

  it('validates and confirms the forgot-username flow', () => {
    const { fixture, c } = create();
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success');

    c.openForgotUsername();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();

    c.submitForgotUsername();
    expect(c.forgotUsernameForm.touched).toBe(true);
    expect(c.fuInvalid('name')).toBe(true);
    expect(c.pendingAction()).toBeNull();

    c.forgotUsernameForm.patchValue({ name: 'Raka', identity: '', email: 'bukan-email' });
    c.submitForgotUsername();
    expect(c.fuInvalid('identity')).toBe(true);
    expect(c.fuInvalid('email')).toBe(true);

    c.forgotUsernameForm.patchValue({ identity: '3201010101010001', email: 'raka@example.com' });
    expect(c.fuInvalid('email')).toBe(false);
    c.submitForgotUsername();

    expect(c.pendingAction()).toBe('username');
    expect(c.confirmMessage()).toContain('username');

    c.confirmRequest();
    expect(c.pendingAction()).toBeNull();
    expect(success).toHaveBeenCalledWith('Permintaan terkirim', expect.any(String));
  });

  it('makes the identity optional when the user forgot it', () => {
    const { c } = create();

    c.forgotUsernameForm.patchValue({ identity: '' });
    c.forgotUsernameForm.controls.identity.markAsTouched();
    expect(c.fuInvalid('identity')).toBe(true);

    c.forgotUsernameForm.controls.forgotIdentity.setValue(true);
    expect(c.fuInvalid('identity')).toBe(false);

    c.forgotUsernameForm.controls.forgotIdentity.setValue(false);
    expect(c.fuInvalid('identity')).toBe(true);
  });

  it('validates and confirms the forgot-password flow', () => {
    const { c } = create();
    const toast = TestBed.inject(ToastService);
    const success = vi.spyOn(toast, 'success');

    c.openForgotPassword();
    c.submitForgotPassword();
    expect(c.forgotPasswordForm.touched).toBe(true);
    expect(c.fpInvalid()).toBe(true);
    expect(c.pendingAction()).toBeNull();

    c.forgotPasswordForm.patchValue({ email: 'raka@example.com' });
    c.submitForgotPassword();
    expect(c.pendingAction()).toBe('password');
    expect(c.confirmMessage()).toContain('reset');

    c.confirmRequest();
    expect(success).toHaveBeenCalledWith('Permintaan reset terkirim', expect.any(String));
  });

  it('searches names asynchronously and clears the options', () => {
    vi.useFakeTimers();
    const { c } = create();

    c.searchNames('');
    expect(c.nameOptions()).toEqual([]);
    expect(c.nameLoading()).toBe(false);

    c.searchNames('raka');
    expect(c.nameQuery()).toBe('raka');
    expect(c.nameLoading()).toBe(true);
    vi.advanceTimersByTime(400);
    expect(c.nameLoading()).toBe(false);
    expect(c.nameOptions().map((option: { label: string }) => option.label)).toEqual([
      'Raka Pratama',
    ]);

    c.searchNames('zzz');
    vi.advanceTimersByTime(400);
    expect(c.nameOptions()).toEqual([]);
  });

  it('collapses and expands the report banner', () => {
    const { fixture } = create();

    host(fixture)
      .querySelector<HTMLButtonElement>('button[aria-label="Perkecil informasi"]')
      ?.click();
    fixture.detectChanges();

    const expand = host(fixture).querySelector<HTMLButtonElement>(
      'button[aria-label="Tampilkan informasi"]',
    );
    expect(expand).not.toBeNull();
    expect(host(fixture).textContent).toContain('klik saya!');

    expand?.click();
    fixture.detectChanges();
    expect(host(fixture).querySelector('button[aria-label="Perkecil informasi"]')).not.toBeNull();
  });

  it('navigates to the registration page', () => {
    const { c } = create();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    c.register();

    expect(navigate).toHaveBeenCalledWith(['/public/registration']);
  });

  it('ignores a second submit while loading and completes only once', () => {
    vi.useFakeTimers();
    const session = TestBed.inject(SessionService);
    const login = vi.spyOn(session, 'login');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { c } = create();

    c.submit();
    c.submit();
    expect(c.loading()).toBe(true);
    expect(login).not.toHaveBeenCalled();

    vi.advanceTimersByTime(900);
    expect(c.loading()).toBe(false);
    expect(login).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('switches languages and theme from the header controls', () => {
    const { fixture, c } = create();
    const before = document.documentElement.classList.contains('dark');

    c.setLang('ja');
    fixture.detectChanges();
    expect(host(fixture).textContent).toContain('ベンダー管理システム');

    const headerButtons = host(fixture).querySelectorAll<HTMLButtonElement>('header button');
    headerButtons[1]?.click();
    fixture.detectChanges();
    expect(document.documentElement.classList.contains('dark')).toBe(!before);
  });
});
