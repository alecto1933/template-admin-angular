import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiCollapsible } from '../../shared/ui/collapsible/collapsible';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { UiSwitch } from '../../shared/ui/switch/switch';

@Component({
  selector: 'app-collapsible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon, UiCollapsible, UiSwitch],
  templateUrl: './collapsible.page.html',
})
export class CollapsiblePage {
  protected readonly advancedOpen = signal(false);
  protected readonly emailNotif = signal(true);
  protected readonly pushNotif = signal(false);
  protected readonly dynamicRows = signal(['Baris pertama', 'Baris kedua']);

  protected addRow(): void {
    this.dynamicRows.update((rows) => [...rows, `Baris ${rows.length + 1}`]);
  }

  protected removeRow(): void {
    this.dynamicRows.update((rows) => rows.slice(0, -1));
  }
}
