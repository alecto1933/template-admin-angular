import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

/**
 * Accessible toggle switch with two-way binding:
 *
 * <ui-switch [(checked)]="notifications" label="Email" />
 */
@Component({
  selector: 'ui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      class="inline-flex cursor-pointer items-center gap-3 select-none"
      [class.cursor-not-allowed]="disabled()"
      [class.opacity-60]="disabled()"
    >
      <input
        type="checkbox"
        class="peer sr-only"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() || label() || null"
        (change)="onChange($event)"
      />
      <span
        class="ui-switch-track peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 peer-focus-visible:outline-none peer-disabled:cursor-not-allowed"
        [attr.data-checked]="checked() ? '' : null"
      >
        <span class="ui-switch-thumb" [attr.data-checked]="checked() ? '' : null"></span>
      </span>
      @if (label()) {
        <span class="text-sm font-medium text-foreground">{{ label() }}</span>
      }
    </label>
  `,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
  },
})
export class UiSwitch {
  readonly checked = model(false);
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });

  protected onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
