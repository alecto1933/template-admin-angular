import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export type PopoverAlign = 'start' | 'center' | 'end';

/**
 * Controlled popover panel positioned under its trigger.
 *
 * <span class="relative inline-flex">
 *   <button (click)="open.set(!open())">Open</button>
 *   <ui-popover [(open)]="open" align="start">...</ui-popover>
 * </span>
 */
@Component({
  selector: 'ui-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-popover',
    '[attr.data-align]': 'align()',
    '[attr.data-open]': 'open() ? "" : null',
  },
})
export class UiPopover {
  readonly open = model(false);
  readonly align = input<PopoverAlign>('start');
}
