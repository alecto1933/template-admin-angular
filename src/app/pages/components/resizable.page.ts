import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiResizable } from '../../shared/ui/resizable/resizable';

@Component({
  selector: 'app-resizable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiResizable],
  templateUrl: './resizable.page.html',
})
export class ResizablePage {
  protected readonly horizontal = signal(50);
  protected readonly vertical = signal(40);
  protected readonly dynamic = signal(50);
  protected readonly extraContent = signal(false);
}
