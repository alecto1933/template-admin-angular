import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAttachment, UiAttachmentGroup } from '../../shared/ui/attachment/attachment';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-attachment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiAttachment, UiAttachmentGroup],
  templateUrl: './attachment.page.html',
})
export class AttachmentPage {
  private readonly toast = inject(ToastService);

  protected openFile(name: string): void {
    this.toast.info('Membuka lampiran', `${name} akan dibuka di viewer.`);
  }

  protected download(name: string): void {
    this.toast.success('Unduhan dimulai', name);
  }

  protected remove(name: string): void {
    this.toast.warning('File dihapus', `${name} dihapus dari daftar (demo).`);
  }
}
