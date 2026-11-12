import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiPopover } from '../../shared/ui/popover/popover';

@Component({
  selector: 'app-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiPopover],
  templateUrl: './popover.page.html',
})
export class PopoverPage {
  protected readonly basicOpen = signal(false);
  protected readonly startOpen = signal(false);
  protected readonly centerOpen = signal(false);
  protected readonly endOpen = signal(false);
}
