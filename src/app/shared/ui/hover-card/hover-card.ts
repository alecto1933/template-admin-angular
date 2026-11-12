import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Panel that appears when the ancestor with class `group` is hovered or
 * contains focus. Wrap trigger and card in `<span class="group relative inline-flex">`.
 */
@Component({
  selector: 'ui-hover-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-hover-card',
    '[attr.data-side]': 'side()',
  },
})
export class UiHoverCard {
  readonly side = input<HoverCardSide>('bottom');
}
