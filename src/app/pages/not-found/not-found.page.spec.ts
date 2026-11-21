import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LanguageService } from '@/core/language.service';
import { NotFoundPage } from '@/pages/not-found/not-found.page';

function text(fixture: { nativeElement: unknown }): string {
  return ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');
}

describe('NotFoundPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the 404 marker and the Indonesian copy', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const body = text(fixture);
    expect(body).toContain('404');
    expect(body).toContain('Halaman tidak ditemukan');
    expect(body).toContain('Kembali ke halaman utama');
    expect(body).toContain('Halaman sebelumnya');
  });

  it('renders the English and Japanese translated title and buttons', () => {
    const language = TestBed.inject(LanguageService);
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    language.set('en');
    fixture.detectChanges();
    let body = text(fixture);
    expect(body).toContain('Page not found');
    expect(body).toContain('Back to home');
    expect(body).toContain('Previous page');

    language.set('ja');
    fixture.detectChanges();
    body = text(fixture);
    expect(body).toContain('ページが見つかりません');
    expect(body).toContain('ホームに戻る');
    expect(body).toContain('前のページ');
  });

  it('navigates to /home from the primary action', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const goHome = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => (button.textContent ?? '').includes('Kembali ke halaman utama'));
    expect(goHome).toBeDefined();

    goHome?.click();

    expect(navigate).toHaveBeenCalledWith(['/home']);
  });
});
