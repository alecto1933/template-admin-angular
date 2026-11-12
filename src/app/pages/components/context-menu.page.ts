import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    UiPageHeader,
    UiButton,
    UiIcon,
  ],
  templateUrl: './context-menu.page.html',
})
export class ContextMenuPage {
  private readonly toast = inject(ToastService);

  protected readonly showLabels = signal(true);
  protected readonly density = signal<'comfortable' | 'compact'>('comfortable');

  protected action(label: string): void {
    this.toast.info(label, 'Aksi context menu dijalankan (demo).');
  }
}
