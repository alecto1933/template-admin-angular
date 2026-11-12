import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiDatePicker } from '../../shared/ui/date-picker/date-picker';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon, UiDatePicker],
  templateUrl: './date-picker.page.html',
})
export class DatePickerPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly multiple = signal<Date[]>([]);
  protected readonly range = signal<Date[]>([]);
  protected readonly single = signal<Date[]>([]);
  protected readonly shortValue = signal<Date[]>([]);
  protected readonly longValue = signal<Date[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    single: [[] as Date[]],
    inputPicker: [[] as Date[]],
    multiple: [[] as Date[]],
    range: [[] as Date[]],
  });

  protected submit(): void {
    const value = this.form.getRawValue();
    this.toast.success(
      'Tanggal disimpan',
      `${value.single.length} single · ${value.multiple.length} multiple · ${value.range.length} range`,
    );
  }
}
