import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { SelectOption, UiSelect } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';

const COUNTRIES: SelectOption[] = [
  { value: 'id', label: 'Indonesia', group: 'Asia Tenggara' },
  { value: 'my', label: 'Malaysia', group: 'Asia Tenggara' },
  { value: 'sg', label: 'Singapura', group: 'Asia Tenggara' },
  { value: 'jp', label: 'Jepang', group: 'Asia Timur' },
  { value: 'kr', label: 'Korea Selatan', group: 'Asia Timur' },
  { value: 'cn', label: 'Tiongkok', group: 'Asia Timur' },
];

const MANY: SelectOption[] = Array.from({ length: 24 }, (_, index) => ({
  value: `opt-${index + 1}`,
  label: `Opsi ${index + 1}`,
  description: index % 4 === 0 ? 'Direkomendasikan' : undefined,
}));

const PROJECTS: SelectOption[] = [
  { value: 'prj-2049', label: 'Aplikasi Kasir', description: 'prj-2049' },
  { value: 'prj-2050', label: 'Dashboard Inventori', description: 'prj-2050' },
  { value: 'prj-2051', label: 'Portal Mitra', description: 'prj-2051' },
];

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon, UiSelect],
  templateUrl: './select.page.html',
})
export class SelectPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly countries = COUNTRIES;
  protected readonly many = MANY;
  protected readonly projects = PROJECTS;

  protected readonly single = signal('id');
  protected readonly multi = signal<string[]>(['id', 'sg']);
  protected readonly projectValue = signal('prj-2050');

  protected readonly form = this.fb.nonNullable.group({
    country: ['id'],
    frameworks: [['angular'] as string[]],
  });

  protected submit(): void {
    const value = this.form.getRawValue();
    this.toast.success('Form dikirim', `${value.country} · ${value.frameworks.join(', ') || '—'}`);
  }
}
