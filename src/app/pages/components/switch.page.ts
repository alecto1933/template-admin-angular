import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';

@Component({
  selector: 'app-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiSwitch],
  templateUrl: './switch.page.html',
})
export class SwitchPage {
  protected readonly email = signal(true);
  protected readonly push = signal(false);
  protected readonly digest = signal(true);
  protected readonly marketing = signal(false);
  protected readonly twoFactor = signal(true);
  protected readonly invalid = signal(false);
  protected readonly choice = signal('pro');
  protected readonly sizes = signal(true);
}
