import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';

@Component({
  selector: 'app-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiSwitch],
  templateUrl: './field.page.html',
})
export class FieldPage {
  protected readonly notifications = signal(true);
  protected readonly plan = signal('pro');
}
