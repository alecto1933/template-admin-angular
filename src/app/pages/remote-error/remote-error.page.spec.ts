import { TestBed } from '@angular/core/testing';
import { ROUTE_RELOAD_TARGET } from '@/core/federation/route-reload';
import { LAYOUT_TEXTS } from '@/core/i18n/layout.texts';
import { TranslationService } from '@/core/i18n/translation.service';
import { RemoteErrorPage } from '@/pages/remote-error/remote-error.page';

function text(fixture: { nativeElement: unknown }): string {
  return ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');
}

describe('RemoteErrorPage', () => {
  let replace = vi.fn<(url: string) => void>();

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    replace = vi.fn<(url: string) => void>();
    await TestBed.configureTestingModule({
      imports: [RemoteErrorPage],
      providers: [
        {
          provide: ROUTE_RELOAD_TARGET,
          useValue: { href: 'http://localhost:1933/ivendor/#/profile-management', replace },
        },
      ],
    }).compileComponents();
  });

  it('renders the translated error copy for every language', () => {
    const i18n = TestBed.inject(TranslationService);
    const fixture = TestBed.createComponent(RemoteErrorPage);
    fixture.detectChanges();

    let body = text(fixture);
    expect(body).toContain(LAYOUT_TEXTS.id.remoteErrorTitle);
    expect(body).toContain(LAYOUT_TEXTS.id.remoteErrorMessage);
    expect(body).toContain(LAYOUT_TEXTS.id.remoteRetry);

    i18n.setLanguage('en');
    fixture.detectChanges();
    body = text(fixture);
    expect(body).toContain('Profile module could not be loaded');
    expect(body).toContain('Check your connection and try again. The rest of the app still works.');
    expect(body).toContain('Try again');

    i18n.setLanguage('ja');
    fixture.detectChanges();
    body = text(fixture);
    expect(body).toContain('プロフィールを読み込めません');
    expect(body).toContain('接続を確認して再試行してください。他の機能は利用できます。');
    expect(body).toContain('再試行');
  });

  it('announces the failure assertively', () => {
    const fixture = TestBed.createComponent(RemoteErrorPage);
    fixture.detectChanges();

    const card = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('aria-live')).toBe('assertive');
  });

  it('retries with a full reload of the profile route, not router navigation', () => {
    const fixture = TestBed.createComponent(RemoteErrorPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();

    expect(replace).toHaveBeenCalledTimes(1);
    const target = new URL(replace.mock.calls[0][0]);
    expect(target.hash).toBe('#/profile-management');
    expect(target.searchParams.get('retry')).toMatch(/^\d+$/);
  });
});
