import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiAutocomplete, AutocompleteOption } from '@/shared/ui/autocomplete/autocomplete';

const OPTIONS: AutocompleteOption[] = [
  { value: 'apel', label: 'Apel Merah' },
  { value: 'aprikot', label: 'Aprikot' },
  { value: 'pisang', label: 'Pisang' },
  { value: 'mangga', label: 'Mangga' },
];

const KEY_OPTIONS: AutocompleteOption[] = [
  { value: 'apel', label: 'Apel Merah', group: 'Buah' },
  { value: 'aprikot', label: 'Aprikot', group: 'Buah', disabled: true },
  { value: 'pisang', label: 'Pisang', group: 'Lain' },
  { value: 'mangga', label: 'Mangga', group: 'Lain' },
];

@Component({
  imports: [UiAutocomplete],
  template: `
    <ui-autocomplete
      [(value)]="selected"
      [options]="options"
      [clearable]="true"
      (optionSelected)="picked = $event"
    />
  `,
})
class AutocompleteHost {
  options = OPTIONS;
  selected = '';
  picked: AutocompleteOption | null = null;
}

@Component({
  imports: [UiAutocomplete],
  template: `
    <ui-autocomplete
      [(value)]="selected"
      [options]="options"
      [clearable]="true"
      [highlightMatch]="true"
      [separators]="true"
      ariaLabel="Cari buah"
      emptyText="Kosong"
      (searchChange)="searches.push($event)"
    />
  `,
})
class HighlightHost {
  options = KEY_OPTIONS;
  selected = '';
  searches: string[] = [];
}

@Component({
  imports: [UiAutocomplete],
  template: `
    <ui-autocomplete
      [(value)]="selected"
      [options]="options"
      [clearable]="true"
      [disabled]="disabled()"
    />
  `,
})
class DisabledHost {
  options = OPTIONS;
  selected = 'apel';
  disabled = signal(false);
}

@Component({
  imports: [UiAutocomplete],
  template: `
    <ui-autocomplete
      [(value)]="selected"
      [options]="options"
      [clearable]="true"
      [allowCustom]="true"
      [openOnFocus]="false"
      [minQueryLength]="2"
      [loading]="loading()"
      (searchChange)="searches.push($event)"
    />
  `,
})
class CustomHost {
  options = KEY_OPTIONS;
  selected = '';
  searches: string[] = [];
  loading = signal(false);
}

@Component({
  imports: [UiAutocomplete],
  template: `<ui-autocomplete [options]="options" [loading]="true" />`,
})
class LoadingHost {
  options: AutocompleteOption[] = [];
}

type AnyFixture = {
  nativeElement: HTMLElement;
  componentInstance: unknown;
  detectChanges(): void;
  whenStable(): Promise<unknown>;
};

function inputOf(fixture: AnyFixture): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
}

function dispatchKey(input: HTMLInputElement, key: string): void {
  input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function focusInput(input: HTMLInputElement): void {
  input.dispatchEvent(new Event('focus'));
}

describe('UiAutocomplete', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await TestBed.configureTestingModule({ imports: [AutocompleteHost] }).compileComponents();
  });

  it('renders the combobox input', () => {
    const fixture = TestBed.createComponent(AutocompleteHost);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;

    expect(input).not.toBeNull();
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('filters options as the user types', () => {
    const fixture = TestBed.createComponent(AutocompleteHost);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;

    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll(
      '.ui-autocomplete-option',
    ) as NodeListOf<HTMLElement>;

    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Apel Merah');
    expect(options[1].textContent).toContain('Aprikot');
  });

  it('emits the selected option and updates the bound value', () => {
    const fixture = TestBed.createComponent(AutocompleteHost);
    fixture.detectChanges();

    const host = fixture.componentInstance as AutocompleteHost;
    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;

    input.value = 'pis';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('.ui-autocomplete-option') as HTMLElement;
    option.click();
    fixture.detectChanges();

    expect(host.selected).toBe('pisang');
    expect(host.picked?.label).toBe('Pisang');
    expect(input.value).toBe('Pisang');
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
  });

  it('shows the empty state when nothing matches', () => {
    const fixture = TestBed.createComponent(AutocompleteHost);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;

    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.ui-autocomplete-empty') as HTMLElement;

    expect(empty.textContent?.trim()).toBe('Tidak ada hasil');
    expect(fixture.nativeElement.querySelectorAll('.ui-autocomplete-option').length).toBe(0);
  });

  it('navigates options with the keyboard, skipping disabled entries', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.detectChanges();
    const input = inputOf(fixture);

    focusInput(input);
    fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('true');

    dispatchKey(input, 'ArrowDown');
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-0');
    expect(fixture.nativeElement.querySelector('[data-active="true"]')?.textContent).toContain(
      'Apel Merah',
    );

    dispatchKey(input, 'ArrowDown');
    fixture.detectChanges();
    // Aprikot (index 1) is disabled and gets skipped.
    expect(input.getAttribute('aria-activedescendant')).toContain('option-2');

    dispatchKey(input, 'ArrowDown');
    dispatchKey(input, 'ArrowDown');
    fixture.detectChanges();
    // Wraps back to the first enabled option.
    expect(input.getAttribute('aria-activedescendant')).toContain('option-0');

    dispatchKey(input, 'ArrowUp');
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-3');

    dispatchKey(input, 'Home');
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-0');

    dispatchKey(input, 'End');
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-3');

    dispatchKey(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('mangga');
    expect(input.value).toBe('Mangga');
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
  });

  it('opens with ArrowUp from a closed panel and selects the last option', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.detectChanges();
    const input = inputOf(fixture);

    focusInput(input);
    dispatchKey(input, 'Escape');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();

    dispatchKey(input, 'ArrowUp');
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-3');

    dispatchKey(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('mangga');
  });

  it('closes on Escape and Tab and restores the value label on blur', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.componentInstance.selected = 'pisang';
    fixture.componentInstance.options = OPTIONS;
    fixture.detectChanges();
    const input = inputOf(fixture);

    focusInput(input);
    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.ui-autocomplete-option').length).toBe(2);

    dispatchKey(input, 'Escape');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
    expect(input.value).toBe('Pisang');

    focusInput(input);
    fixture.detectChanges();
    dispatchKey(input, 'Tab');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();

    focusInput(input);
    input.value = 'zz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('Pisang');
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
  });

  it('opens on input click and renders highlight, groups, separators, and empty text', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.detectChanges();
    const input = inputOf(fixture);

    input.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).not.toBeNull();

    input.value = 'ap';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('.ui-autocomplete-option');
    expect(options.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-group')?.textContent).toContain(
      'Buah',
    );
    expect(options[0].querySelector('mark')?.textContent).toBe('Ap');
    expect(options[1].classList.contains('border-t')).toBe(true);
    expect(fixture.componentInstance.searches).toContain('ap');

    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-empty')?.textContent?.trim()).toBe(
      'Kosong',
    );
  });

  it('clears the selection and refocuses the input', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.detectChanges();
    const input = inputOf(fixture);

    focusInput(input);
    dispatchKey(input, 'ArrowDown');
    dispatchKey(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('apel');

    const clearButton = fixture.nativeElement.querySelector(
      'button[aria-label="Hapus pilihan"]',
    ) as HTMLButtonElement;
    expect(clearButton).not.toBeNull();
    clearButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected).toBe('');
    expect(input.value).toBe('');
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).not.toBeNull();
  });

  it('ignores interaction and hides the clear button when disabled', () => {
    const fixture = TestBed.createComponent(DisabledHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const input = inputOf(fixture);

    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('button[aria-label="Hapus pilihan"]')).toBeNull();

    focusInput(input);
    input.click();
    dispatchKey(input, 'ArrowDown');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports custom values with a minimum query length and no open-on-focus', () => {
    const fixture = TestBed.createComponent(CustomHost);
    fixture.detectChanges();
    const input = inputOf(fixture);

    focusInput(input);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();

    input.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();

    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).not.toBeNull();
    expect(fixture.componentInstance.searches).toContain('ab');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('ab');

    focusInput(input);
    input.value = 'zz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    dispatchKey(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('zz');
    expect(fixture.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
  });

  it('keeps custom text on Escape and shows the loading state', () => {
    const custom = TestBed.createComponent(CustomHost);
    custom.detectChanges();
    const customInput = inputOf(custom);

    focusInput(customInput);
    customInput.value = 'zz';
    customInput.dispatchEvent(new Event('input'));
    custom.detectChanges();
    dispatchKey(customInput, 'Escape');
    custom.detectChanges();

    expect(custom.nativeElement.querySelector('.ui-autocomplete-panel')).toBeNull();
    expect(customInput.value).toBe('zz');
    // allowCustom writes through on every keystroke.
    expect(custom.componentInstance.selected).toBe('zz');

    const loading = TestBed.createComponent(LoadingHost);
    loading.detectChanges();
    focusInput(inputOf(loading));
    loading.detectChanges();

    expect(loading.nativeElement.querySelector('.ui-autocomplete-empty')?.textContent?.trim()).toBe(
      'Mencari…',
    );
    expect(loading.nativeElement.querySelector('.animate-spin')).not.toBeNull();
  });

  it('supports the CVA writeValue and setDisabledState hooks', () => {
    const fixture = TestBed.createComponent(HighlightHost);
    fixture.detectChanges();
    const cmp = fixture.debugElement.query(By.directive(UiAutocomplete))
      .componentInstance as UiAutocomplete;
    const input = inputOf(fixture);

    cmp.writeValue('pisang');
    fixture.detectChanges();
    expect(input.value).toBe('Pisang');

    cmp.setDisabledState(true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    cmp.setDisabledState(false);
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
  });
});
