import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAspectRatio } from '../../shared/ui/aspect-ratio/aspect-ratio';
import { UiBadge } from '../../shared/ui/badge/badge';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-aspect-ratio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiBadge, UiIcon, UiAspectRatio],
  templateUrl: './aspect-ratio.page.html',
})
export class AspectRatioPage {
  private readonly toast = inject(ToastService);

  protected playVideo(): void {
    this.toast.info('Video demo', 'Hubungkan tombol putar ini ke pemutar video milik Anda.');
  }
}
