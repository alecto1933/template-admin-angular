import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiAlertDialog } from '../../shared/ui/alert-dialog/alert-dialog';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-alert-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiAlertDialog],
  templateUrl: './alert-dialog.page.html',
})
export class AlertDialogPage {
  private readonly toast = inject(ToastService);

  protected confirmed(message: string, description: string): void {
    this.toast.success(message, description);
  }

  protected cancelled(action: string): void {
    this.toast.info('Dibatalkan', `${action} tidak dijalankan.`);
  }
}
