import { TestBed } from '@angular/core/testing';
import { LanguageService } from '@/core/language.service';
import { ToastService } from '@/shared/ui/toast/toast.service';
import { HomePage } from '@/pages/home/home.page';

describe('HomePage', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    await TestBed.configureTestingModule({ imports: [HomePage] }).compileComponents();
  });

  it('renders five application cards with image backgrounds', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '#quick-access button',
      ),
    );
    expect(cards).toHaveLength(5);

    const images = cards.map((card) => {
      const layers = Array.from(card.querySelectorAll<HTMLElement>('span[aria-hidden="true"]'));
      const background = layers.find((layer) => layer.style.backgroundImage);
      return background?.style.backgroundImage ?? '';
    });

    expect(images).toEqual([
      expect.stringContaining('/images/apps/vendor-profile.webp'),
      expect.stringContaining('/images/apps/purchase-order.webp'),
      expect.stringContaining('/images/apps/billing.webp'),
      expect.stringContaining('/images/apps/bidding-auction.webp'),
      expect.stringContaining('/images/apps/capa-tracker.webp'),
    ]);
  });

  it('shows a toast when a quick-access card is clicked', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const toast = TestBed.inject(ToastService);

    const first = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '#quick-access button',
    );
    first?.click();
    fixture.detectChanges();

    expect(toast.toasts()).toHaveLength(1);
    expect(toast.toasts()[0].title).toBe('Segera hadir');
    expect(toast.toasts()[0].description).toContain('Vendor Profile Management');
  });

  it('links the need-help card to the support mailbox', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a[href^="mailto:"]',
    );
    expect(link?.getAttribute('href')).toBe('mailto:aionomic-support@aio.co.id');
    expect(link?.getAttribute('aria-label')).toContain('Butuh Bantuan');
    expect(link?.textContent).toContain('Hubungi Dukungan');
  });

  it('switches rendered copy and persists the language for id, en, and ja', () => {
    const language = TestBed.inject(LanguageService);

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    let text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Aktivitas Terbaru');
    expect(text).toContain('Modul superapp Anda dalam satu tempat.');
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('a[href^="mailto:"]')
        ?.getAttribute('aria-label'),
    ).toContain('Butuh Bantuan');

    language.set('en');
    fixture.detectChanges();
    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Recent Activity');
    expect(text).toContain('Your superapp modules in one place.');
    expect(text).toContain('Our support team is ready to help you.');
    expect(localStorage.getItem('ivendor-language')).toBe('en');

    language.set('ja');
    fixture.detectChanges();
    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('最近のアクティビティ');
    expect(text).toContain('スーパーアプリのモジュールを一か所に。');
    const card = (fixture.nativeElement as HTMLElement).querySelector('#quick-access button');
    expect(card?.getAttribute('aria-label')).toContain('ベンダープロフィール管理');
    expect(localStorage.getItem('ivendor-language')).toBe('ja');
  });
});
