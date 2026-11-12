import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { UiIcon } from '../icon/icon';

/**
 * Single animated collapsible panel. For a list of panels use ui-accordion.
 *
 * <ui-collapsible title="Detail" [(open)]="open">...</ui-collapsible>
 */
@Component({
  selector: 'ui-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <button
      type="button"
      class="ui-collapsible-trigger"
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      <span class="min-w-0 flex-1 text-left">
        <span class="block text-sm font-semibold text-foreground">{{ title() }}</span>
        @if (description()) {
          <span class="mt-0.5 block text-xs text-muted-foreground">
            {{ description() }}
          </span>
        }
      </span>
      <ui-icon name="chevron-down" class="ui-collapsible-chevron size-4" />
    </button>

    <div
      class="ui-collapsible-content"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.inert]="open() ? null : ''"
    >
      <div class="ui-collapsible-inner">
        <div class="ui-collapsible-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'ui-collapsible',
    '[attr.data-state]': 'open() ? "open" : "closed"',
  },
})
export class UiCollapsible {
  readonly title = input('');
  readonly description = input('');
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected toggle(): void {
    if (!this.disabled()) {
      this.open.update((open) => !open);
    }
  }
}
