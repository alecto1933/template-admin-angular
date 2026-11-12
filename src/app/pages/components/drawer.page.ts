import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiDrawer } from '../../shared/ui/drawer/drawer';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiDrawer],
  templateUrl: './drawer.page.html',
})
export class DrawerPage {
  protected readonly rightOpen = signal(false);
  protected readonly leftOpen = signal(false);
  protected readonly topOpen = signal(false);
  protected readonly bottomOpen = signal(false);
  protected readonly nestedOne = signal(false);
  protected readonly nestedTwo = signal(false);
}
