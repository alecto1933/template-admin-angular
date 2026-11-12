import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutocompleteOption, UiAutocomplete } from '../../shared/ui/autocomplete/autocomplete';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiMultiCombobox } from '../../shared/ui/multi-combobox/multi-combobox';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

const FRAMEWORKS: AutocompleteOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

const GROUPED: AutocompleteOption[] = [
  { value: 'angular', label: 'Angular', group: 'Framework' },
  { value: 'react', label: 'React', group: 'Framework' },
  { value: 'vue', label: 'Vue', group: 'Framework' },
  { value: 'jakarta', label: 'Jakarta', group: 'Kota' },
  { value: 'bandung', label: 'Bandung', group: 'Kota' },
  { value: 'surabaya', label: 'Surabaya', group: 'Kota' },
];

const PEOPLE: AutocompleteOption[] = [
  { value: 'usr-101', label: 'Raka Pratama', description: 'raka@alecto.id' },
  { value: 'usr-102', label: 'Dewi Lestari', description: 'dewi@alecto.id' },
  { value: 'usr-103', label: 'Bagas Saputra', description: 'bagas@alecto.id' },
];

@Component({
  selector: 'app-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    UiPageHeader,
    UiButton,
    UiIcon,
    UiAutocomplete,
    UiMultiCombobox,
  ],
  templateUrl: './combobox.page.html',
})
export class ComboboxPage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private asyncTimer: ReturnType<typeof setTimeout> | null = null;
  private asyncMultiTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly frameworks = FRAMEWORKS;
  protected readonly grouped = GROUPED;
  protected readonly people = PEOPLE;

  protected readonly multi = signal<string[]>(['angular', 'vue']);
  protected readonly autoMulti = signal<string[]>([]);
  protected readonly asyncMulti = signal<string[]>([]);
  protected readonly asyncMultiOptions = signal<AutocompleteOption[]>([]);
  protected readonly asyncMultiLoading = signal(false);
  protected readonly asyncOptions = signal<AutocompleteOption[]>([]);
  protected readonly asyncLoading = signal(false);

  protected readonly popupOpen = signal(false);
  protected readonly customPopupOpen = signal(false);
  protected readonly formPopupOpen = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    single: ['', Validators.required],
    multiple: [[] as string[]],
    popover: [''],
  });

  protected searchAsync(query: string): void {
    if (this.asyncTimer) clearTimeout(this.asyncTimer);
    const term = query.trim();
    if (!term) {
      this.asyncOptions.set([]);
      this.asyncLoading.set(false);
      return;
    }
    this.asyncOptions.set([]);
    this.asyncLoading.set(true);
    this.asyncTimer = setTimeout(() => {
      this.asyncOptions.set(
        FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(term.toLowerCase())),
      );
      this.asyncLoading.set(false);
    }, 600);
  }

  protected searchAsyncMulti(query: string): void {
    if (this.asyncMultiTimer) clearTimeout(this.asyncMultiTimer);
    const term = query.trim();
    if (!term) {
      this.asyncMultiOptions.set([]);
      this.asyncMultiLoading.set(false);
      return;
    }
    this.asyncMultiOptions.set([]);
    this.asyncMultiLoading.set(true);
    this.asyncMultiTimer = setTimeout(() => {
      this.asyncMultiOptions.set(
        FRAMEWORKS.filter((option) => option.label.toLowerCase().includes(term.toLowerCase())),
      );
      this.asyncMultiLoading.set(false);
    }, 600);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.toast.success(
      'Form dikirim',
      `Single: ${this.form.controls.single.value || '—'} · Multiple: ${
        this.form.controls.multiple.value.length
      } item`,
    );
  }
}
