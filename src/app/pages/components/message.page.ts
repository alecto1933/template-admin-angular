import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAttachment } from '../../shared/ui/attachment/attachment';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiAttachment],
  templateUrl: './message.page.html',
})
export class MessagePage {
  private readonly toast = inject(ToastService);

  protected action(label: string): void {
    this.toast.info(label, 'Aksi message dijalankan (demo).');
  }
}
