import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiPageHeader, UiButton, UiIcon],
  templateUrl: './navigation-menu.page.html',
})
export class NavigationMenuPage {
  protected readonly active = signal('dashboard');
  protected readonly controlled = signal('orders');
  protected readonly nestedOpen = signal(true);
}
