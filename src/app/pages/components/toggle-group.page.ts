import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiPageHeader, UiButton, UiIcon],
  templateUrl: './toggle-group.page.html',
})
export class ToggleGroupPage {
  private readonly toast = inject(ToastService);

  protected readonly align = signal('left');
  protected readonly multi = signal<string[]>(['bold']);
  protected readonly size = signal('md');
  protected readonly vertical = signal('overview');
  protected readonly custom = signal('grid');

  protected toggleMulti(value: string): void {
    this.multi.update((values) =>
      values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
    );
  }

  protected submit(): void {
    this.toast.success(
      'Pengaturan disimpan',
      `Rata ${this.align()} · Format ${this.multi().join(', ') || '—'}`,
    );
  }
}
