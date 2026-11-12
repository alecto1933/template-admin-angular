import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutocompleteOption, UiAutocomplete } from '../../shared/ui/autocomplete/autocomplete';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';
import { UiPageHeader } from '../../shared/ui/page-header/page-header';
import { ToastService } from '../../shared/ui/toast/toast.service';

const FRAMEWORKS: AutocompleteOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'astro', label: 'Astro' },
  { value: 'ember', label: 'Ember' },
];

const GROUPED_OPTIONS: AutocompleteOption[] = [
  { value: 'angular', label: 'Angular', group: 'Framework' },
  { value: 'react', label: 'React', group: 'Framework' },
  { value: 'vue', label: 'Vue', group: 'Framework' },
  { value: 'svelte', label: 'Svelte', group: 'Framework' },
  { value: 'jakarta', label: 'Jakarta', group: 'Kota' },
  { value: 'bandung', label: 'Bandung', group: 'Kota' },
  { value: 'surabaya', label: 'Surabaya', group: 'Kota' },
  { value: 'denpasar', label: 'Denpasar', group: 'Kota' },
  { value: 'typescript', label: 'TypeScript', group: 'Bahasa' },
  { value: 'javascript', label: 'JavaScript', group: 'Bahasa' },
  { value: 'go', label: 'Go', group: 'Bahasa' },
];

const PEOPLE: AutocompleteOption[] = [
  {
    value: 'usr-101',
    label: 'Raka Pratama',
    description: 'Admin · raka@alecto.id',
  },
  {
    value: 'usr-102',
    label: 'Dewi Lestari',
    description: 'Product Lead · dewi@alecto.id',
  },
  {
    value: 'usr-103',
    label: 'Bagas Saputra',
    description: 'Engineer · bagas@alecto.id',
  },
  {
    value: 'usr-104',
    label: 'Siti Nurhaliza',
    description: 'Finance · siti@alecto.id',
  },
];

const PROJECTS: AutocompleteOption[] = [
  {
    value: 'prj-2049',
    label: 'Aplikasi Kasir',
    description: 'prj-2049 · 8 anggota',
  },
  {
    value: 'prj-2050',
    label: 'Dashboard Inventori',
    description: 'prj-2050 · 4 anggota',
  },
  {
    value: 'prj-2051',
    label: 'Portal Mitra',
    description: 'prj-2051 · 6 anggota',
  },
  {
    value: 'prj-2052',
    label: 'Mobile Catalog',
    description: 'prj-2052 · 3 anggota',
  },
];

@Component({
  selector: 'app-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, UiPageHeader, UiButton, UiIcon, UiAutocomplete],
  templateUrl: './autocomplete.page.html',
})
export class AutocompletePage {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private asyncTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly frameworks = FRAMEWORKS;
  protected readonly groupedOptions = GROUPED_OPTIONS;
  protected readonly people = PEOPLE;
  protected readonly projects = PROJECTS;

  protected readonly personValue = signal('usr-102');
  protected readonly projectValue = signal('prj-2050');
  protected readonly freeText = signal('');
  protected readonly asyncOptions = signal<AutocompleteOption[]>([]);
  protected readonly asyncLoading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    framework: ['', Validators.required],
  });
  protected readonly formSubmitted = signal(false);

  protected readonly freeForm = this.fb.nonNullable.group({
    topic: ['', Validators.required],
  });
  protected readonly freeFormSubmitted = signal(false);

  protected onAsyncSearch(query: string): void {
    if (this.asyncTimer) {
      clearTimeout(this.asyncTimer);
    }

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
    }, 700);
  }

  protected submitForm(): void {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.toast.success('Form dikirim', `Framework: ${this.form.controls.framework.value}`);
  }

  protected resetForm(): void {
    this.form.reset();
    this.formSubmitted.set(false);
  }

  protected submitFreeForm(): void {
    this.freeFormSubmitted.set(true);
    this.freeForm.markAllAsTouched();

    if (this.freeForm.invalid) {
      return;
    }

    this.toast.success('Form dikirim', `Topik: ${this.freeForm.controls.topic.value}`);
  }

  protected resetFreeForm(): void {
    this.freeForm.reset();
    this.freeFormSubmitted.set(false);
  }
}
