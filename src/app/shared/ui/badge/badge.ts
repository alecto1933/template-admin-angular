import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';

/**
 * <span uiBadge variant="success">Aktif</span>
 */
@Component({
  selector: '[uiBadge]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class UiBadge {
  readonly variant = input<BadgeVariant>('default');
}
