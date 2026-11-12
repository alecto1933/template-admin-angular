import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiCollapsible } from '../../shared/ui/collapsible/collapsible';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiDrawer } from '../../shared/ui/drawer/drawer';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-trace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiBadge, UiIcon, UiCollapsible, UiDialog, UiDrawer],
  templateUrl: './trace.page.html',
})
export class TracePage {
  protected readonly drawerOpen = signal(false);
}
