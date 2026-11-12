import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { IconName } from '../../shared/ui/icon/icons';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface DemoAlert {
  id: number;
  variant: AlertVariant;
  title: string;
  message: string;
  icon: IconName;
}

const INITIAL_ALERTS: DemoAlert[] = [
  {
    id: 1,
    variant: 'info',
    title: 'Pembaruan tersedia',
    message: 'Versi 1.1 membawa komponen Accordion dan halaman dokumentasi baru.',
    icon: 'info',
  },
  {
    id: 2,
    variant: 'warning',
    title: 'Verifikasi email',
    message: 'Konfirmasi alamat email untuk mengaktifkan notifikasi transaksional.',
    icon: 'triangle-alert',
  },
];

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './alert.page.html',
})
export class AlertPage {
  private nextId = 3;

  protected readonly dismissible = signal<DemoAlert[]>([...INITIAL_ALERTS]);

  protected dismiss(id: number): void {
    this.dismissible.update((alerts) => alerts.filter((alert) => alert.id !== id));
  }

  protected restore(): void {
    this.dismissible.set(INITIAL_ALERTS.map((alert) => ({ ...alert, id: this.nextId++ })));
  }
}
