import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessionService, DEMO_USER } from '@/core/state/session.service';
import { LanguageService } from '@/core/language.service';
import { AppTopbar } from '@/layout/topbar';
import { ToastService } from '@/shared/ui/toast/toast.service';

@Component({ selector: 'app-test-page', template: 'page' })
class StubPage {}

function host(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function menuButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.ui-menu-item'));
}

function buttonByText(text: string): HTMLButtonElement | undefined {
  return menuButtons().find((button) => (button.textContent ?? '').trim().includes(text));
}

async function openMenu(fixture: ComponentFixture<unknown>, ariaLabel: string): Promise<void> {
  const trigger = host(fixture).querySelector<HTMLButtonElement>(
    `button[aria-label="${ariaLabel}"]`,
  );
  expect(trigger).not.toBeNull();
  trigger?.click();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('AppTopbar', () => {
  let showModal: ReturnType<typeof vi.fn>;
  let closeDialog: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    showModal = vi.fn();
    closeDialog = vi.fn();
    HTMLDialogElement.prototype.showModal = showModal as never;
    HTMLDialogElement.prototype.close = closeDialog as never;

    await TestBed.configureTestingModule({
      imports: [AppTopbar],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('falls back to the guest identity without a session', () => {
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    const text = host(fixture).textContent ?? '';
    expect(text).toContain('?');
    expect(text).toContain('Tamu');
    expect(host(fixture).querySelector('button[aria-label="Menu pengguna"]')).not.toBeNull();
  });

  it('renders the logged-in identity: initials, name, and role', () => {
    const session = TestBed.inject(SessionService);
    session.login(DEMO_USER);

    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    const text = host(fixture).textContent ?? '';
    expect(text).toContain('RP');
    expect(text).toContain('Raka Pratama');
    expect(text).toContain('Admin');
    expect(text).not.toContain('Tamu');
  });

  it('lists the three languages and applies a switch to tooltip and aria-label', async () => {
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();
    const language = TestBed.inject(LanguageService);

    await openMenu(fixture, 'Language: Indonesia');

    const labels = menuButtons().map((button) => (button.textContent ?? '').trim());
    expect(labels.some((label) => label.includes('Indonesia'))).toBe(true);
    expect(labels.some((label) => label.includes('English'))).toBe(true);
    expect(labels.some((label) => label.includes('日本語'))).toBe(true);

    buttonByText('English')?.click();
    fixture.detectChanges();

    expect(language.lang()).toBe('en');
    expect(host(fixture).querySelector('button[aria-label="Language: English"]')).not.toBeNull();
    const tooltips = Array.from(host(fixture).querySelectorAll('ui-tooltip')).map((node) =>
      (node.textContent ?? '').trim(),
    );
    expect(tooltips).toContain('English');

    await openMenu(fixture, 'Language: English');
    buttonByText('日本語')?.click();
    fixture.detectChanges();

    expect(language.lang()).toBe('ja');
    expect(host(fixture).querySelector('button[aria-label="Language: 日本語"]')).not.toBeNull();
  });

  it('exposes Help, dark-mode, and Sign out in the user menu and toggles the theme', async () => {
    TestBed.inject(SessionService).login(DEMO_USER);
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Menu pengguna');

    expect(buttonByText('Bantuan')).toBeDefined();
    expect(buttonByText('Mode gelap')).toBeDefined();
    expect(buttonByText('Keluar')).toBeDefined();

    buttonByText('Mode gelap')?.click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('opens the logout confirmation and signs out on confirm', async () => {
    const session = TestBed.inject(SessionService);
    session.login(DEMO_USER);
    const router = TestBed.inject(Router);
    const logout = vi.spyOn(session, 'logout');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const success = vi.spyOn(TestBed.inject(ToastService), 'success');

    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Menu pengguna');
    buttonByText('Keluar')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(showModal).toHaveBeenCalled();

    const confirm = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => (button.textContent ?? '').trim() === 'Ya, keluar',
    );
    expect(confirm).toBeDefined();
    confirm?.click();
    fixture.detectChanges();

    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(session.isAuthenticated()).toBe(false);
    expect(success).toHaveBeenCalledWith('Berhasil keluar', 'Sesi demo telah diakhiri.');
  });
  it('keeps the session when the logout confirmation is cancelled', async () => {
    const session = TestBed.inject(SessionService);
    session.login(DEMO_USER);
    const logout = vi.spyOn(session, 'logout');
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Menu pengguna');
    buttonByText('Keluar')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const cancel = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => (button.textContent ?? '').trim() === 'Batal',
    );
    expect(cancel).toBeDefined();
    cancel?.click();
    fixture.detectChanges();

    expect(logout).not.toHaveBeenCalled();
    expect(session.isAuthenticated()).toBe(true);
    expect(session.user()).toEqual(DEMO_USER);
  });

  it('emits toggleNavigation from the hamburger button', () => {
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    let toggles = 0;
    fixture.componentInstance.toggleNavigation.subscribe(() => (toggles += 1));

    host(fixture)
      .querySelector<HTMLButtonElement>('button[aria-label="Buka atau tutup navigasi"]')
      ?.click();

    expect(toggles).toBe(1);
  });

  it('opens notifications and shows info toasts for an item and for view-all', async () => {
    const toast = TestBed.inject(ToastService);
    const info = vi.spyOn(toast, 'info');

    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Notifikasi');

    const items = menuButtons();
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.some((item) => (item.textContent ?? '').includes('Pembayaran diterima'))).toBe(true);
    expect(items.some((item) => (item.textContent ?? '').includes('Stok hampir habis'))).toBe(true);
    expect(items.some((item) => (item.textContent ?? '').includes('Anggota baru bergabung'))).toBe(true);

    buttonByText('Pembayaran diterima')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(info).toHaveBeenCalledWith(
      'Pembayaran diterima',
      'Invoice #INV-2049 sebesar Rp 4.250.000 telah lunas.',
    );

    await openMenu(fixture, 'Notifikasi');
    buttonByText('Lihat semua notifikasi')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(info).toHaveBeenCalledWith(
      'Notifikasi',
      'Halaman daftar notifikasi bisa ditambahkan sesuai kebutuhan aplikasi Anda.',
    );
  });

  it('shows the help toast from the user menu', async () => {
    const toast = TestBed.inject(ToastService);
    const info = vi.spyOn(toast, 'info');
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Menu pengguna');
    buttonByText('Bantuan')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(info).toHaveBeenCalledWith('Bantuan', expect.stringContaining('Butuh Bantuan'));
  });

  it('toggles the theme back to light from the user menu', async () => {
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await openMenu(fixture, 'Menu pengguna');
    buttonByText('Mode gelap')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await openMenu(fixture, 'Menu pengguna');
    expect(buttonByText('Mode terang')).toBeDefined();
    buttonByText('Mode terang')?.click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('cycles the language back to Indonesian and updates notification texts', async () => {
    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();
    const language = TestBed.inject(LanguageService);

    language.set('ja');
    fixture.detectChanges();

    await openMenu(fixture, 'Language: 日本語');
    buttonByText('Indonesia')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(language.lang()).toBe('id');
    expect(host(fixture).querySelector('button[aria-label="Language: Indonesia"]')).not.toBeNull();

    await openMenu(fixture, 'Notifikasi');
    expect(menuButtons().some((item) => (item.textContent ?? '').includes('Pembayaran diterima'))).toBe(
      true,
    );
  });

  it('updates the page title on NavigationEnd from the deepest route data', async () => {
    const router = TestBed.inject(Router);
    router.resetConfig([
      {
        path: 'reports',
        children: [{ path: '', component: StubPage, data: { page: 'Laporan Penjualan' } }],
      },
    ]);

    const fixture = TestBed.createComponent(AppTopbar);
    fixture.detectChanges();

    await router.navigate(['/reports']);
    fixture.detectChanges();

    expect(host(fixture).textContent).toContain('Laporan Penjualan');
  });
});
