import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LanguageService } from '@/core/language.service';
import { NAV_SECTIONS, NavSection } from '@/core/nav';
import { AppSidebar } from '@/layout/sidebar';
import { ToastService } from '@/shared/ui/toast/toast.service';

const EXTRA_SECTIONS: NavSection[] = [
  {
    label: 'Menu',
    items: [
      {
        labelKey: 'navMenu',
        path: '/components',
        icon: 'package',
        children: [{ label: 'Tombol', path: '/components/buttons' }],
      },
      { labelKey: 'help', path: '/help', icon: 'circle-help' },
    ],
  },
];

function withExtraSections(fixture: ReturnType<typeof TestBed.createComponent<AppSidebar>>) {
  (fixture.componentInstance as unknown as { sections: NavSection[] }).sections = [
    ...NAV_SECTIONS,
    ...EXTRA_SECTIONS,
  ];
}

@Component({ selector: 'app-test-home', template: 'home' })
class StubHome {}

describe('AppSidebar', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [provideRouter([{ path: 'home', component: StubHome }])],
    }).compileComponents();
  });

  it('renders the Home navigation link when expanded', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector<HTMLAnchorElement>('nav a[href="/home"]');
    expect(link).not.toBeNull();
    expect(link?.textContent).toContain('Home');
    expect(host.querySelectorAll('ui-tooltip')).toHaveLength(0);

    const aside = host.querySelector('aside');
    expect(aside?.getAttribute('data-collapsed')).toBe('false');
    expect(aside?.getAttribute('aria-label')).toBe('Navigasi utama');
  });

  it('shows tooltips with the label when collapsed', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const aside = host.querySelector('aside');
    expect(aside?.getAttribute('data-collapsed')).toBe('true');
    expect(aside?.getAttribute('data-mobile-open')).toBe('false');

    const tooltips = Array.from(host.querySelectorAll('ui-tooltip'));
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0].textContent?.trim()).toBe('Home');
    expect(tooltips[0].getAttribute('role')).toBe('tooltip');
  });

  it('translates labels and tooltips into Japanese', () => {
    TestBed.inject(LanguageService).set('ja');

    const fixture = TestBed.createComponent(AppSidebar);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const tooltip = host.querySelector('ui-tooltip');
    expect(tooltip?.textContent?.trim()).toBe('ホーム');
    expect(host.querySelector('aside')?.getAttribute('aria-label')).toBe('メインナビゲーション');
    expect(host.textContent).toContain('ホーム');
  });

  it('emits closeMobile when a navigation link is clicked', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    fixture.detectChanges();

    let closed = 0;
    fixture.componentInstance.closeMobile.subscribe(() => (closed += 1));

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'nav a[href="/home"]',
    );
    link?.click();

    expect(closed).toBe(1);
  });

  it('emits closeMobile from the brand link and the mobile close button', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    fixture.detectChanges();

    let closed = 0;
    fixture.componentInstance.closeMobile.subscribe(() => (closed += 1));

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLAnchorElement>('a[href="/home"]')?.click();
    host.querySelector<HTMLButtonElement>('button[aria-label="Tutup menu"]')?.click();

    expect(closed).toBe(2);
  });

  it('renders grouped navigation and toggles the submenu when expanded', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    withExtraSections(fixture);
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const groupButton = host.querySelector<HTMLButtonElement>('button[aria-expanded]');
    expect(groupButton).not.toBeNull();
    // '/components' starts expanded.
    expect(groupButton?.getAttribute('aria-expanded')).toBe('true');
    const submenu = host.querySelector<HTMLElement>('.sidebar-submenu');
    expect(submenu?.hidden).toBe(false);
    expect(submenu?.textContent).toContain('Tombol');

    groupButton?.click();
    fixture.detectChanges();
    expect(groupButton?.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector<HTMLElement>('.sidebar-submenu')?.hidden).toBe(true);

    groupButton?.click();
    fixture.detectChanges();
    expect(groupButton?.getAttribute('aria-expanded')).toBe('true');
  });

  it('expands the group and emits toggleCollapse when collapsed', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    withExtraSections(fixture);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    let toggles = 0;
    fixture.componentInstance.toggleCollapse.subscribe(() => (toggles += 1));

    const host = fixture.nativeElement as HTMLElement;
    const groupButton = host.querySelector<HTMLButtonElement>('button[aria-expanded]');
    expect(groupButton?.getAttribute('aria-expanded')).toBe('true');

    groupButton?.click();
    fixture.detectChanges();

    expect(toggles).toBe(1);
    expect(groupButton?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the mobile drawer when a submenu link is clicked', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    withExtraSections(fixture);
    fixture.detectChanges();

    let closed = 0;
    fixture.componentInstance.closeMobile.subscribe(() => (closed += 1));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLAnchorElement>('a[href="/components/buttons"]')
      ?.click();

    expect(closed).toBe(1);
  });

  it('shows the help toast when the help item is clicked', () => {
    const fixture = TestBed.createComponent(AppSidebar);
    withExtraSections(fixture);
    fixture.detectChanges();

    const toast = TestBed.inject(ToastService);
    const info = vi.spyOn(toast, 'info');

    (fixture.nativeElement as HTMLElement)
      .querySelectorAll<HTMLButtonElement>('button')
      .forEach((button) => {
        if ((button.textContent ?? '').trim() === 'Bantuan') {
          button.click();
        }
      });
    fixture.detectChanges();

    expect(info).toHaveBeenCalledWith('Bantuan', expect.stringContaining('Butuh Bantuan'));
  });

  it('highlights the active route and expands its group after navigation', async () => {
    const fixture = TestBed.createComponent(AppSidebar);
    withExtraSections(fixture);
    // Point the group child at /home so the active route belongs to the group.
    (fixture.componentInstance as unknown as { sections: NavSection[] }).sections = [
      {
        label: 'Menu',
        items: [
          {
            labelKey: 'navMenu',
            path: '/components',
            icon: 'package',
            children: [{ label: 'Beranda', path: '/home' }],
          },
          { labelKey: 'navHome', path: '/home', icon: 'home', exact: true },
        ],
      },
    ];
    fixture.detectChanges();

    await TestBed.inject(Router).navigate(['/home']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('nav a[href="/home"]')?.classList.contains('is-active')).toBe(true);
    expect(
      host.querySelector('button[aria-expanded]')?.classList.contains('text-sidebar-accent-foreground'),
    ).toBe(true);
    expect(host.querySelector<HTMLButtonElement>('button[aria-expanded]')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
  });

  it('renders English tooltips and aria labels', () => {
    TestBed.inject(LanguageService).set('en');

    const fixture = TestBed.createComponent(AppSidebar);
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('aside')?.getAttribute('aria-label')).toBe('Main navigation');
    expect(host.querySelector('ui-tooltip')?.textContent?.trim()).toBe('Home');
  });
});
