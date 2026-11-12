import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Reserves space for media with a fixed aspect ratio using the native CSS
 * `aspect-ratio` property. The projected content fills the box; add
 * `object-cover` to images/video to avoid distortion.
 *
 * <ui-aspect-ratio [ratio]="16 / 9" class="rounded-xl">
 *   <img src="foto.jpg" alt="..." class="size-full object-cover" />
 * </ui-aspect-ratio>
 */
@Component({
  selector: 'ui-aspect-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-aspect-ratio',
    '[style.aspect-ratio]': 'ratio()',
  },
})
export class UiAspectRatio {
  /** Any valid CSS aspect-ratio value, e.g. `16 / 9`, `1`, or `0.75`. */
  readonly ratio = input<number | string>(16 / 9);
}
