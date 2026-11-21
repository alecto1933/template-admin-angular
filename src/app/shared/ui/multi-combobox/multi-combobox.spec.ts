import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutocompleteOption } from '@/shared/ui/autocomplete/autocomplete';
import { UiMultiCombobox } from '@/shared/ui/multi-combobox/multi-combobox';

@Component({
  imports: [UiMultiCombobox],
  template: `
    <ui-multi-combobox
      [options]="options()"
      [(value)]="value"
      [clearable]="true"
      [disabled]="disabled()"
      [loading]="loading()"
      [filterLocally]="filterLocally()"
      [autoHighlight]="autoHighlight()"
      [invalid]="invalid()"
      placeholder="Pilih tag"
      (searchChange)="lastSearch.set($event)"
    />
  `,
})
class MultiComboboxHost {
  readonly value = signal<string[]>([]);
  readonly lastSearch = signal('');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly filterLocally = signal(true);
  readonly autoHighlight = signal(false);
  readonly invalid = signal(false);
  readonly options = signal<AutocompleteOption[]>([
    { value: 'a', label: 'Anggur', group: 'Buah' },
    { value: 'b', label: 'Bayam', group: 'Sayur' },
    { value: 'c', label: 'Blueberry', group: 'Buah' },
  ]);
}

describe('UiMultiCombobox', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<MultiComboboxHost>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MultiComboboxHost] }).compileComponents();
    fixture = TestBed.createComponent(MultiComboboxHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    vi.restoreAllMocks();
  });

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const input = (): HTMLInputElement => host().querySelector('.ui-multi-input') as HTMLInputElement;

  it('opens the panel on focus and renders grouped options', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(host().querySelectorAll('[role="option"]')).toHaveLength(3);
    expect(host().querySelectorAll('.ui-multi-panel').length).toBe(1);
    expect(host().textContent).toContain('Buah');
    expect(host().textContent).toContain('Sayur');
  });

  it('adds a chip when an option is clicked', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    const option = host().querySelector<HTMLButtonElement>('[role="option"]')!;
    option.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['a']);
    expect(host().querySelector('.ui-multi-chip')?.textContent).toContain('Anggur');
    expect(option.getAttribute('aria-selected')).toBe('true');
  });

  it('removes a chip through its remove button', () => {
    fixture.componentInstance.value.set(['a', 'b']);
    fixture.detectChanges();

    expect(host().querySelectorAll('.ui-multi-chip')).toHaveLength(2);

    host()
      .querySelector<HTMLButtonElement>('button[aria-label="Hapus Anggur"]')!
      .click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual(['b']);
    expect(host().querySelectorAll('.ui-multi-chip')).toHaveLength(1);
  });

  it('clears all selections with the clear button', () => {
    fixture.componentInstance.value.set(['a', 'c']);
    fixture.detectChanges();

    host()
      .querySelector<HTMLButtonElement>('button[aria-label="Hapus semua pilihan"]')!
      .click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual([]);
    expect(host().querySelectorAll('.ui-multi-chip')).toHaveLength(0);
  });

  it('filters options locally while typing', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    input().value = 'blu';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const options = host().querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Blueberry');
    expect(fixture.componentInstance.lastSearch()).toBe('blu');
  });

  it('toggles selection with keyboard enter and closes on escape', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(input().getAttribute('aria-activedescendant')).toContain('option-0');

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['a']);

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host().querySelector('.ui-multi-panel')).toBeNull();
  });

  it('highlights the first option on focus and supports ArrowUp wrapping', () => {
    fixture.componentInstance.autoHighlight.set(true);
    fixture.detectChanges();

    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();
    expect(input().getAttribute('aria-activedescendant')).toContain('option-0');
    expect(fixture.componentInstance.lastSearch()).toBe('');

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(input().getAttribute('aria-activedescendant')).toContain('option-2');

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(input().getAttribute('aria-activedescendant')).toContain('option-0');
  });

  it('toggles a selected option off and updates the active option on hover', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    const options = host().querySelectorAll<HTMLButtonElement>('[role="option"]');
    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['a']);

    options[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);

    options[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute('data-active')).toBe('true');
  });

  it('does nothing on Enter without an active option and keeps the panel open', () => {
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual([]);
    expect(host().querySelector('.ui-multi-panel')).not.toBeNull();
  });

  it('supports filterLocally=false, empty and loading states, and invalid styling', () => {
    fixture.componentInstance.filterLocally.set(false);
    fixture.detectChanges();

    input().dispatchEvent(new Event('focus', { bubbles: true }));
    input().value = 'zzz';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host().querySelectorAll('[role="option"]')).toHaveLength(3);

    fixture.componentInstance.filterLocally.set(true);
    fixture.detectChanges();
    expect(host().querySelectorAll('[role="option"]')).toHaveLength(0);
    expect(host().textContent).toContain('Tidak ada hasil');

    fixture.componentInstance.options.set([]);
    fixture.componentInstance.loading.set(true);
    fixture.componentInstance.invalid.set(true);
    input().value = '';
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(host().textContent).toContain('Mencari…');
    expect(host().querySelector('.ui-multi-control')?.hasAttribute('data-invalid')).toBe(true);
  });

  it('hides the clear button while loading and shows it otherwise', () => {
    fixture.componentInstance.value.set(['a']);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    expect(host().querySelector('button[aria-label="Hapus semua pilihan"]')).toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(host().querySelector('button[aria-label="Hapus semua pilihan"]')).not.toBeNull();
  });

  it('clears and reopens the panel, emitting an empty search', () => {
    fixture.componentInstance.value.set(['a', 'c']);
    fixture.detectChanges();

    host()
      .querySelector<HTMLButtonElement>('button[aria-label="Hapus semua pilihan"]')!
      .click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual([]);
    expect(fixture.componentInstance.lastSearch()).toBe('');
    expect(host().querySelector('.ui-multi-panel')).not.toBeNull();
  });

  it('keeps the panel open when a chip is removed and closes outside', () => {
    fixture.componentInstance.value.set(['a']);
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    host()
      .querySelector<HTMLButtonElement>('button[aria-label="Hapus Anggur"]')!
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);
    expect(host().querySelector('.ui-multi-panel')).not.toBeNull();

    input().click();
    fixture.detectChanges();
    expect(host().querySelector('.ui-multi-panel')).not.toBeNull();

    document.body.click();
    fixture.detectChanges();
    expect(host().querySelector('.ui-multi-panel')).toBeNull();
  });

  it('does not open or show a clear control when disabled', () => {
    fixture.componentInstance.value.set(['a']);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(input().disabled).toBe(true);
    expect(host().querySelector('button[aria-label="Hapus semua pilihan"]')).toBeNull();

    (host().querySelector('.ui-multi-control') as HTMLElement).click();
    input().dispatchEvent(new Event('focus', { bubbles: true }));
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(host().querySelector('.ui-multi-panel')).toBeNull();
  });

  it('uses an empty placeholder when chips exist and supports CVA hooks', () => {
    fixture.componentInstance.value.set(['a']);
    fixture.detectChanges();
    expect(input().placeholder).toBe('');

    fixture.componentInstance.value.set([]);
    fixture.detectChanges();
    expect(input().placeholder).toBe('Pilih tag');

    const cmp = fixture.debugElement.query(By.directive(UiMultiCombobox))
      .componentInstance as UiMultiCombobox;

    cmp.writeValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);

    cmp.writeValue(['b']);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['b']);

    input().dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();
    expect(host().querySelector('.ui-multi-panel')).not.toBeNull();

    cmp.setDisabledState(true);
    fixture.detectChanges();
    expect(host().querySelector('.ui-multi-panel')).toBeNull();
    expect(input().disabled).toBe(true);
  });
});
