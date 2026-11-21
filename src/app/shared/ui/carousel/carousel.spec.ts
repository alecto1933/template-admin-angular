import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiCarousel } from '@/shared/ui/carousel/carousel';

@Component({
  imports: [UiCarousel],
  template: `
    <ui-carousel id="horizontal" [slides]="2" [spacing]="20">
      <article class="slide">Satu</article>
      <article class="slide">Dua</article>
    </ui-carousel>

    <ui-carousel id="vertical" orientation="vertical" size="lg" ariaLabel="Galeri">
      <article class="slide">Satu</article>
    </ui-carousel>
  `,
})
class CarouselHost {}

describe('UiCarousel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CarouselHost] }).compileComponents();
  });

  it('renders slides and applies host configuration', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#horizontal') as HTMLElement;

    expect(element.querySelectorAll('.slide').length).toBe(2);
    expect(
      element.querySelector('.ui-carousel-viewport')?.getAttribute('aria-roledescription'),
    ).toBe('carousel');
    expect(element.getAttribute('data-orientation')).toBe('horizontal');
    expect(element.style.getPropertyValue('--ui-carousel-slides')).toBe('2');
    expect(element.style.getPropertyValue('--ui-carousel-gap')).toBe('20px');
  });

  it('scrolls the viewport forward and backward with the next/prev buttons', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#horizontal') as HTMLElement;
    const viewport = element.querySelector('.ui-carousel-viewport') as HTMLElement;
    const scrollBy = vi.fn();
    viewport.scrollBy = scrollBy;

    const [previous, next] = element.querySelectorAll<HTMLButtonElement>(
      '.ui-carousel-controls button',
    );

    next.click();
    expect(scrollBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: 20, behavior: 'smooth' }),
    );

    previous.click();
    expect(scrollBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: -20, behavior: 'smooth' }),
    );
  });

  it('scrolls vertically and exposes vertical control labels', () => {
    const fixture = TestBed.createComponent(CarouselHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#vertical') as HTMLElement;
    const viewport = element.querySelector('.ui-carousel-viewport') as HTMLElement;
    const scrollBy = vi.fn();
    viewport.scrollBy = scrollBy;

    const buttons = element.querySelectorAll<HTMLButtonElement>('.ui-carousel-controls button');

    expect(buttons[0].getAttribute('aria-label')).toBe('Geser ke atas');
    expect(buttons[1].getAttribute('aria-label')).toBe('Geser ke bawah');
    expect(element.getAttribute('data-size')).toBe('lg');

    buttons[1].click();
    expect(scrollBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ top: 16, behavior: 'smooth' }),
    );
  });
});
