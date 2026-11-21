import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LAYOUT_TEXTS } from '@/core/i18n/layout.texts';
import { TranslationService } from '@/core/i18n/translation.service';
import { RemoteErrorPage } from '@/pages/remote-error/remote-error.page';

function text(fixture: { nativeElement: unknown }): string {
  return ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');
}

describe('RemoteErrorPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({
      imports: [RemoteErrorPage],
      providers: [provideRouter([])],
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

  it('retries with a cache-busting query param', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(RemoteErrorPage);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();

    expect(navigate).toHaveBeenCalledWith(['/profile-management'], {
      queryParams: { retry: expect.any(Number) },
    });
  });
});
