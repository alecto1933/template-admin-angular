import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `<ui-icon [name]="icon()" class="size-full animate-spin" />`,
  host: {
    class: 'ui-spinner',
    role: 'status',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'label()',
  },
})
export class UiSpinner {
  readonly size = input<SpinnerSize>('md');
  readonly icon = input<IconName>('loader-circle');
  readonly label = input('Memuat');
}
