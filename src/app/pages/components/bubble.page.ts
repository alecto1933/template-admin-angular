import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-bubble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CdkMenu, CdkMenuItem, CdkMenuTrigger, UiPageHeader, UiButton, UiIcon],
  templateUrl: './bubble.page.html',
})
export class BubblePage {
  private readonly toast = inject(ToastService);
  protected readonly expanded = signal(false);

  protected action(label: string): void {
    this.toast.info(label, 'Aksi bubble dijalankan (demo).');
  }

  protected react(label: string): void {
    this.toast.success(`Reaksi ${label}`, 'Reaksi ditambahkan (demo).');
  }
}
