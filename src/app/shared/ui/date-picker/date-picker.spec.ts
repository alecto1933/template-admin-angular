import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiDatePicker } from '@/shared/ui/date-picker/date-picker';

@Component({
  imports: [UiDatePicker],
  template: `
    <ui-date-picker [(value)]="value" [disabled]="disabled()" [dateFormat]="format()" />
  `,
})
class DatePickerHost {
  readonly value = signal<Date[]>([]);
  readonly disabled = signal(false);
  readonly format = signal<'short' | 'long' | 'iso'>('iso');
}

describe('UiDatePicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DatePickerHost] }).compileComponents();
  });

  it('opens the calendar popover on click', () => {
    const fixture = TestBed.createComponent(DatePickerHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input')!;
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('ui-calendar')).toBeNull();

    host.querySelector<HTMLElement>('.ui-input-group')!.click();
    fixture.detectChanges();

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('ui-calendar')).not.toBeNull();
  });

  it('selects a day and reflects it in the label', () => {
    const fixture = TestBed.createComponent(DatePickerHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLElement>('.ui-input-group')!.click();
    fixture.detectChanges();

    const day = host.querySelector<HTMLButtonElement>('.ui-calendar-day')!;
    const expected = day.textContent!.trim();
    day.click();
    fixture.detectChanges();

    const value = fixture.componentInstance.value();
    expect(value).toHaveLength(1);
    expect(value[0].getDate()).toBe(Number(expected));

    const input = host.querySelector<HTMLInputElement>('input')!;
    expect(input.value).toBe(new Intl.DateTimeFormat('sv-SE').format(value[0]));
  });

  it('clears the selected date and closes the popover', () => {
    const fixture = TestBed.createComponent(DatePickerHost);
    fixture.componentInstance.value.set([new Date(2026, 0, 15)]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('2026-01-15');

    host.querySelector<HTMLButtonElement>('button[aria-label="Hapus tanggal"]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toEqual([]);
    expect(host.querySelector<HTMLInputElement>('input')!.value).toBe('');
  });

  it('does not open when disabled', () => {
    const fixture = TestBed.createComponent(DatePickerHost);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('input')!;
    expect(input.disabled).toBe(true);

    host.querySelector<HTMLElement>('.ui-input-group')!.click();
    fixture.detectChanges();

    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('ui-calendar')).toBeNull();
  });

  it('closes the popover when clicking outside the host', () => {
    const fixture = TestBed.createComponent(DatePickerHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLElement>('.ui-input-group')!.click();
    fixture.detectChanges();
    expect(host.querySelector('ui-calendar')).not.toBeNull();

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.querySelector('ui-calendar')).toBeNull();
  });
});
