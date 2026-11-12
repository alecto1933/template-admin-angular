import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiPageHeader, UiButton, UiIcon],
  templateUrl: './item.page.html',
})
export class ItemPage {
  private readonly toast = inject(ToastService);

  protected action(label: string): void {
    this.toast.info(label, 'Aksi item dijalankan (demo).');
  }
}
