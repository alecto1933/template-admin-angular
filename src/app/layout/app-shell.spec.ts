import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PreferencesService } from '@/core/state/preferences.service';
import { AppShell } from '@/layout/app-shell';

@Component({ selector: 'app-test-page', template: 'page' })
class StubPage {}

function stubViewport(desktop: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: desktop,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('AppShell', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('starts with the sidebar collapsed by default', () => {
    stubViewport(true);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const aside = (fixture.nativeElement as HTMLElement).querySelector('app-sidebar aside');
    expect(aside?.getAttribute('data-collapsed')).toBe('true');
    expect(TestBed.inject(PreferencesService).sidebarCollapsed()).toBe(true);
  });

  it('toggles the sidebar from the hamburger and persists the preference', () => {
    stubViewport(true);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const hamburger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'app-topbar button[aria-label="Buka atau tutup navigasi"]',
    );
    expect(hamburger).not.toBeNull();

    hamburger?.click();
    fixture.detectChanges();

    const preferences = TestBed.inject(PreferencesService);
    expect(preferences.sidebarCollapsed()).toBe(false);
    expect(localStorage.getItem('ivendor-sidebar-collapsed')).toBe('false');

    const aside = (fixture.nativeElement as HTMLElement).querySelector('app-sidebar aside');
    expect(aside?.getAttribute('data-collapsed')).toBe('false');
  });

  it('opens the mobile overlay on small screens and closes it on backdrop click', () => {
    stubViewport(false);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const hamburger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'app-topbar button[aria-label="Buka atau tutup navigasi"]',
    );
    hamburger?.click();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const overlay = host.querySelector<HTMLElement>('div.fixed.inset-0');
    expect(overlay).not.toBeNull();
    expect(host.querySelector('app-sidebar aside')?.getAttribute('data-mobile-open')).toBe('true');
    // The desktop preference is untouched by the mobile drawer.
    expect(TestBed.inject(PreferencesService).sidebarCollapsed()).toBe(true);

    overlay?.click();
    fixture.detectChanges();

    expect(host.querySelector('div.fixed.inset-0')).toBeNull();
    expect(host.querySelector('app-sidebar aside')?.getAttribute('data-mobile-open')).toBe('false');
  });

  it('toggles the mobile drawer closed again from the hamburger', () => {
    stubViewport(false);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const hamburger = host.querySelector<HTMLButtonElement>(
      'app-topbar button[aria-label="Buka atau tutup navigasi"]',
    );

    hamburger?.click();
    fixture.detectChanges();
    expect(host.querySelector('div.fixed.inset-0')).not.toBeNull();

    hamburger?.click();
    fixture.detectChanges();
    expect(host.querySelector('div.fixed.inset-0')).toBeNull();
    expect(host.querySelector('app-sidebar aside')?.getAttribute('data-mobile-open')).toBe('false');
  });

  it('closes the mobile drawer through the sidebar close button', () => {
    stubViewport(false);
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector<HTMLButtonElement>('app-topbar button[aria-label="Buka atau tutup navigasi"]')
      ?.click();
    fixture.detectChanges();
    expect(host.querySelector('app-sidebar aside')?.getAttribute('data-mobile-open')).toBe('true');

    host.querySelector<HTMLButtonElement>('app-sidebar button[aria-label="Tutup menu"]')?.click();
    fixture.detectChanges();

    expect(host.querySelector('app-sidebar aside')?.getAttribute('data-mobile-open')).toBe('false');
    expect(host.querySelector('div.fixed.inset-0')).toBeNull();
  });

  it('closes the drawer and resets the main scroll position on navigation', async () => {
    stubViewport(false);
    const router = TestBed.inject(Router);
    router.resetConfig([{ path: 'home', component: StubPage }]);

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const main = host.querySelector<HTMLElement>('main');
    expect(main).not.toBeNull();
    main!.scrollTop = 320;

    host
      .querySelector<HTMLButtonElement>('app-topbar button[aria-label="Buka atau tutup navigasi"]')
      ?.click();
    fixture.detectChanges();
    expect(host.querySelector('div.fixed.inset-0')).not.toBeNull();

    await router.navigate(['/home']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(main!.scrollTop).toBe(0);
    expect(host.querySelector('div.fixed.inset-0')).toBeNull();
  });
});
