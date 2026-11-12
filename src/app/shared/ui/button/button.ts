import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { UiIcon } from '../icon/icon';

export type ButtonVariant =
  'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'destructive' | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

/**
 * Button styling lives on the native <button> element, so forms and
 * accessibility keep working without a wrapper element.
 *
 * <button uiButton variant="primary" type="submit">Simpan</button>
 */
@Component({
  selector: 'button[uiButton], a[uiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    @if (loading()) {
      <ui-icon name="loader-circle" class="size-4 animate-spin" />
    }
    <ng-content />
  `,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'disabled() || loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
}
