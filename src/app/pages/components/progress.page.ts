import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiProgress } from '../../shared/ui/progress/progress';

@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiProgress],
  templateUrl: './progress.page.html',
})
export class ProgressPage {}
