import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectOption, UiSelect } from '@/shared/ui/select/select';

const OPTIONS: SelectOption[] = [
  { value: 'id', label: 'Indonesia' },
  { value: 'my', label: 'Malaysia', description: 'Asia Tenggara' },
  { value: 'sg', label: 'Singapura', disabled: true },
];

@Component({
  imports: [UiSelect],
  template: `
    <ui-select
      [options]="options()"
      [value]="value()"
      (valueChange)="value.set($event)"
      [multiple]="multiple()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [maxHeight]="maxHeight()"
      placeholder="Pilih negara"
    />
  `,
})
class SelectHost {
  readonly options = signal<SelectOption[]>(OPTIONS);
  readonly value = signal<string | string[]>('');
  readonly multiple = signal(false);
  readonly clearable = signal(false);
  readonly disabled = signal(false);
  readonly invalid = signal(false);
  readonly maxHeight = signal(0);
}

const GROUPED: SelectOption[] = [
  { value: 'a', label: 'Apel', group: 'Buah' },
  { value: 'b', label: 'Bayam', group: 'Sayur' },
  { value: 'c', label: 'Ceri', group: 'Buah' },
];

describe('UiSelect', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectHost] }).compileComponents();
  });

  it('renders the trigger with a placeholder and closed panel', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Pilih negara');
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('opens the listbox and selects an option', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    const listbox = host.querySelector('[role="listbox"]') as HTMLElement;
    const options = host.querySelectorAll<HTMLButtonElement>('[role="option"]');

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.hasAttribute('data-open')).toBe(true);
    expect(listbox).toBeTruthy();
    expect(options.length).toBe(3);
    expect(options[1].textContent).toContain('Malaysia');
    expect(options[1].textContent).toContain('Asia Tenggara');
    expect(options[2].getAttribute('aria-disabled')).toBe('true');

    options[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('my');
    expect(trigger.textContent).toContain('Malaysia');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('supports multiple selection and removing a chip', () => {
    const fixture = TestBed.createComponent(SelectHost);
    const component = fixture.componentInstance;
    component.multiple.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    const options = host.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options[0].click();
    fixture.detectChanges();
    options[1].click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['id', 'my']);
    expect(host.querySelectorAll('.ui-select-chip').length).toBe(2);
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    const removeButton = host.querySelector('.ui-select-chip [aria-label="Hapus Indonesia"]') as HTMLElement;
    removeButton.click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['my']);
    expect(host.querySelectorAll('.ui-select-chip').length).toBe(1);
  });

  it('closes the panel when clicking outside the component', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).toBeTruthy();

    document.body.click();
    fixture.detectChanges();

    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('navigates with arrow keys, skips disabled options, and selects with Enter', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    let options = host.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options[0].getAttribute('data-active')).toBe('true');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute('data-active')).toBe('true');

    // Wraps past the disabled third option back to the first.
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(options[0].getAttribute('data-active')).toBe('true');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute('data-active')).toBe('true');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(component.value()).toBe('my');
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('selects the last enabled option with ArrowUp from a closed panel', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();

    const options = host.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options[1].getAttribute('data-active')).toBe('true');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe('my');
  });

  it('closes on Escape and keeps the panel open on Enter without an active option', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).not.toBeNull();
    expect(fixture.componentInstance.value()).toBe('');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('does not select a disabled option or toggle the same multiple option twice', () => {
    const fixture = TestBed.createComponent(SelectHost);
    const component = fixture.componentInstance;
    component.multiple.set(true);
    component.value.set([]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    let options = host.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options[2].click();
    fixture.detectChanges();
    expect(component.value()).toEqual([]);

    options[0].click();
    fixture.detectChanges();
    expect(component.value()).toEqual(['id']);

    options = host.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options[0].click();
    fixture.detectChanges();
    expect(component.value()).toEqual([]);
  });

  it('clears a single and a multiple selection and opens the panel', () => {
    const single = TestBed.createComponent(SelectHost);
    single.componentInstance.clearable.set(true);
    single.componentInstance.value.set('my');
    single.detectChanges();

    const singleHost = single.nativeElement as HTMLElement;
    singleHost.querySelector<HTMLElement>('[aria-label="Hapus pilihan"]')?.click();
    single.detectChanges();
    expect(single.componentInstance.value()).toBe('');
    expect(singleHost.querySelector('[role="listbox"]')).not.toBeNull();

    const multiple = TestBed.createComponent(SelectHost);
    multiple.componentInstance.multiple.set(true);
    multiple.componentInstance.clearable.set(true);
    multiple.componentInstance.value.set(['id', 'my']);
    multiple.detectChanges();

    const multipleHost = multiple.nativeElement as HTMLElement;
    multipleHost.querySelector<HTMLElement>('[aria-label="Hapus pilihan"]')?.click();
    multiple.detectChanges();
    expect(multiple.componentInstance.value()).toEqual([]);
    expect(multipleHost.querySelectorAll('.ui-select-chip').length).toBe(0);
  });

  it('does not open or show a clear control when disabled', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.clearable.set(true);
    fixture.componentInstance.value.set('my');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;

    expect(trigger.disabled).toBe(true);
    expect(host.querySelector('[aria-label="Hapus pilihan"]')).toBeNull();

    trigger.click();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(host.querySelector('[role="listbox"]')).toBeNull();
  });

  it('renders groups, invalid state, max height, and placeholder for unknown values', () => {
    const fixture = TestBed.createComponent(SelectHost);
    const component = fixture.componentInstance;
    component.options.set(GROUPED);
    component.multiple.set(true);
    component.invalid.set(true);
    component.maxHeight.set(220);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;
    expect(trigger.hasAttribute('data-invalid')).toBe(true);

    trigger.click();
    fixture.detectChanges();

    const listbox = host.querySelector('[role="listbox"]') as HTMLElement;
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    expect(listbox.style.maxHeight).toBe('220px');
    expect(host.querySelectorAll('.ui-select-group').length).toBe(2);

    component.multiple.set(false);
    component.value.set('unknown');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Pilih negara');
  });

  it('supports CVA writeValue and setDisabledState', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector('.ui-select-trigger') as HTMLButtonElement;
    const cmp = fixture.debugElement.query(By.directive(UiSelect))
      .componentInstance as UiSelect;

    cmp.writeValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');

    cmp.writeValue(['id', 'my']);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['id', 'my']);

    trigger.click();
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).not.toBeNull();

    cmp.setDisabledState(true);
    fixture.detectChanges();
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.disabled).toBe(true);
  });
});
