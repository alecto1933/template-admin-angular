import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiPageHeader, UiButton, UiIcon],
  templateUrl: './button-group.page.html',
})
export class ButtonGroupPage {
  private readonly toast = inject(ToastService);
  protected readonly popoverOpen = signal(false);

  protected action(label: string): void {
    this.toast.info(label, 'Aksi button group dijalankan (demo).');
  }

  protected applyFilter(): void {
    this.popoverOpen.set(false);
    this.toast.success('Filter diterapkan', 'Daftar diperbarui (demo).');
  }
}
