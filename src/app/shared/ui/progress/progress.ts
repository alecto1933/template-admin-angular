import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type ProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ui-progress"
      role="progressbar"
      [attr.data-size]="size()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="indeterminate() ? null : value()"
      [attr.aria-valuetext]="indeterminate() ? 'Memuat' : value() + '%'"
    >
      <div
        class="ui-progress-bar"
        [class.ui-progress-indeterminate]="indeterminate()"
        [style.width.%]="indeterminate() ? null : value()"
      ></div>
    </div>
  `,
})
export class UiProgress {
  readonly value = input(0);
  readonly max = input(100);
  readonly size = input<ProgressSize>('md');
  readonly indeterminate = input(false, { transform: booleanAttribute });
}
