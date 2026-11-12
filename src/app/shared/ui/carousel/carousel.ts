import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';
import { UiButton } from '../button/button';
import { UiIcon } from '../icon/icon';

export type CarouselOrientation = 'horizontal' | 'vertical';
export type CarouselSize = 'sm' | 'md' | 'lg';

/**
 * Scroll-snap carousel with native scrolling. Slides are projected directly;
 * each direct child becomes one slide.
 *
 * <ui-carousel [slides]="3" [spacing]="16">
 *   <article>...</article>
 *   <article>...</article>
 * </ui-carousel>
 */
@Component({
  selector: 'ui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiIcon],
  template: `
    <div
      #viewport
      class="ui-carousel-viewport"
      role="region"
      aria-roledescription="carousel"
      [attr.aria-label]="ariaLabel()"
      tabindex="0"
    >
      <div class="ui-carousel-track">
        <ng-content />
      </div>
    </div>

    <div class="ui-carousel-controls">
      <button
        uiButton
        variant="outline"
        size="icon-sm"
        (click)="scroll(-1)"
        [attr.aria-label]="orientation() === 'vertical' ? 'Geser ke atas' : 'Geser ke kiri'"
      >
        <ui-icon
          [name]="orientation() === 'vertical' ? 'chevron-up' : 'chevron-left'"
          class="size-4"
        />
      </button>
      <button
        uiButton
        variant="outline"
        size="icon-sm"
        (click)="scroll(1)"
        [attr.aria-label]="orientation() === 'vertical' ? 'Geser ke bawah' : 'Geser ke kanan'"
      >
        <ui-icon
          [name]="orientation() === 'vertical' ? 'chevron-down' : 'chevron-right'"
          class="size-4"
        />
      </button>
    </div>
  `,
  host: {
    class: 'ui-carousel',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-size]': 'size()',
    '[style.--ui-carousel-slides]': 'slides()',
    '[style.--ui-carousel-gap]': 'spacing() + "px"',
  },
})
export class UiCarousel {
  readonly slides = input(3);
  readonly spacing = input(16);
  readonly orientation = input<CarouselOrientation>('horizontal');
  readonly size = input<CarouselSize>('md');
  readonly ariaLabel = input('Carousel');

  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  protected scroll(direction: 1 | -1): void {
    const viewport = this.viewport().nativeElement;
    const track = viewport.firstElementChild as HTMLElement | null;
    const first = track?.firstElementChild as HTMLElement | null;

    if (!first) {
      return;
    }

    if (this.orientation() === 'vertical') {
      viewport.scrollBy({
        top: direction * (first.offsetHeight + this.spacing()),
        behavior: 'smooth',
      });
    } else {
      viewport.scrollBy({
        left: direction * (first.offsetWidth + this.spacing()),
        behavior: 'smooth',
      });
    }
  }
}
