import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * Tooltip panel shown when the ancestor with class `group` is hovered or
 * focused. Wrap trigger and tooltip in `<span class="group relative inline-flex">`.
 */
@Component({
  selector: 'ui-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-tooltip',
    role: 'tooltip',
    '[attr.data-position]': 'position()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class UiTooltip {
  readonly position = input<TooltipPosition>('top');
  readonly disabled = input(false, { transform: booleanAttribute });
}
