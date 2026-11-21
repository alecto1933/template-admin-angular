import { TestBed } from '@angular/core/testing';
import { RollingTitle } from '@/pages/home/rolling-title';

describe('RollingTitle', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RollingTitle] }).compileComponents();
  });

  function render(text: string): HTMLElement {
    const fixture = TestBed.createComponent(RollingTitle);
    fixture.componentRef.setInput('text', text);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('splits the text into one block per word', () => {
    const host = render('Welcome Vendor');

    const words = host.querySelectorAll<HTMLElement>('.whitespace-nowrap');
    expect(words).toHaveLength(2);
  });

  it('renders every letter twice for the roll effect', () => {
    const host = render('Halo');

    const letters = host.querySelectorAll<HTMLElement>('.ui-letter-roll');
    expect(letters).toHaveLength(4);

    const rendered = Array.from(letters).map((letter) =>
      Array.from(letter.querySelectorAll('span')).map((span) => span.textContent),
    );
    expect(rendered).toEqual([
      ['H', 'H'],
      ['a', 'a'],
      ['l', 'l'],
      ['o', 'o'],
    ]);
  });

  it('keeps letters in order across words and restarts the delay per word', () => {
    const host = render('Hi Ya');

    const letters = Array.from(host.querySelectorAll<HTMLElement>('.ui-letter-roll'));
    expect(letters).toHaveLength(4);
    expect(letters.map((letter) => letter.textContent)).toEqual(['HH', 'ii', 'YY', 'aa']);
    expect(letters.map((letter) => Number.parseFloat(letter.style.transitionDelay))).toEqual([
      0, 22, 0, 22,
    ]);
  });

  it('renders no letters for an empty string', () => {
    const host = render('');

    expect(host.querySelectorAll('.ui-letter-roll')).toHaveLength(0);
  });

  it('exposes the plain text once to assistive technology', () => {
    const host = render('Halo Dunia');

    const srOnly = host.querySelector('.sr-only') as HTMLElement;
    expect(srOnly.textContent?.trim()).toBe('Halo Dunia');

    const visual = host.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(visual).toBeTruthy();
  });
});
