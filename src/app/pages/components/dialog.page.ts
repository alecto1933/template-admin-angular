import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiDialog } from '../../shared/ui/dialog/dialog';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiPageHeader,
    UiButton,
    UiDialog,
    UiIcon,
  ],
  templateUrl: './dialog.page.html',
})
export class DialogPage {
  protected readonly showExtra = signal(false);
  protected readonly paragraphs = Array.from(
    { length: 9 },
    (_, index) =>
      `Bagian ${index + 1}: konten dialog bisa berupa teks, form, tabel, atau komponen lain yang diproyeksikan ke dalam body.`,
  );
}
