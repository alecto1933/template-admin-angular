import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { AppFooter } from '@/layout/footer';

describe('AppFooter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AppFooter] }).compileComponents();
  });

  it('renders the current year, brand, and version', () => {
    const fixture = TestBed.createComponent(AppFooter);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain(`© ${new Date().getFullYear()} iVendor Superapps.`);
    expect(text).toContain(`v${environment.appVersion}`);
  });

  it('keeps the responsive padding classes on the footer and row', () => {
    const fixture = TestBed.createComponent(AppFooter);
    fixture.detectChanges();

    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain('md:px-6');
    expect(footer?.className).toContain('lg:px-8');

    const row = footer?.firstElementChild as HTMLElement;
    expect(row.className).toContain('flex-row');
    expect(row.className).toContain('justify-between');
    expect(row.className).toContain('sm:text-xs');
  });
});
