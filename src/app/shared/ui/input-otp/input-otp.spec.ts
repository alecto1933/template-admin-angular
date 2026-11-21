import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiInputOtp } from '@/shared/ui/input-otp/input-otp';

@Component({
  imports: [UiInputOtp],
  template: `
    <ui-input-otp
      [length]="length()"
      [pattern]="pattern()"
      [separator]="true"
      [(value)]="value"
      [masked]="masked()"
      [disabled]="disabled()"
    />
  `,
})
class InputOtpHost {
  readonly value = signal('');
  readonly length = signal(6);
  readonly pattern = signal<'numeric' | 'alphanumeric'>('numeric');
  readonly masked = signal(false);
  readonly disabled = signal(false);
}

describe('UiInputOtp', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<InputOtpHost>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputOtpHost] }).compileComponents();
    fixture = TestBed.createComponent(InputOtpHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  const inputs = (): HTMLInputElement[] =>
    [...fixture.nativeElement.querySelectorAll('input')] as HTMLInputElement[];

  function type(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function paste(input: HTMLInputElement, text: string | null): void {
    const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
      clipboardData: { getData: (type: string) => string } | null;
    };
    Object.defineProperty(event, 'clipboardData', {
      value: text === null ? null : { getData: () => text },
    });
    input.dispatchEvent(event);
    fixture.detectChanges();
  }

  it('renders one input per digit with a separator', () => {
    expect(inputs()).toHaveLength(6);
    expect(fixture.nativeElement.querySelector('.ui-otp-separator')?.textContent).toContain('–');
    expect(inputs()[0].getAttribute('aria-label')).toBe('Digit 1');
  });

  it('records typed digits and moves focus to the next input', () => {
    type(inputs()[0], '1');

    expect(fixture.componentInstance.value()).toBe('1');
    expect(inputs()[0].value).toBe('1');
    expect(document.activeElement).toBe(inputs()[1]);

    type(inputs()[1], '2');
    expect(fixture.componentInstance.value()).toBe('12');
  });

  it('ignores non-numeric characters in numeric mode', () => {
    type(inputs()[0], 'a');

    expect(fixture.componentInstance.value()).toBe('');
    expect(inputs()[0].value).toBe('');
  });

  it('fills all digits from a paste', () => {
    const input = inputs()[0];
    const event = new Event('paste', { bubbles: true }) as Event & {
      clipboardData: { getData: (type: string) => string };
    };
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: (type: string) => (type === 'text' ? '123456' : '') },
    });

    input.dispatchEvent(event);
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('123456');
    expect(inputs().map((el) => el.value)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('removes the previous digit on backspace when empty', () => {
    type(inputs()[0], '1');
    type(inputs()[1], '2');
    expect(fixture.componentInstance.value()).toBe('12');

    inputs()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('1');
    expect(document.activeElement).toBe(inputs()[1]);
  });

  it('reflects masked and disabled inputs', () => {
    fixture.componentInstance.masked.set(true);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(inputs()[0].type).toBe('password');
    expect(inputs().every((input) => input.disabled)).toBe(true);
  });

  it('produces the complete value when every digit is typed', () => {
    inputs().forEach((input, index) => type(input, String(index + 1)));

    expect(fixture.componentInstance.value()).toBe('123456');
    expect(inputs().map((input) => input.value)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(document.activeElement).toBe(inputs()[5]);
  });

  it('moves focus with the arrow keys and respects the edges', () => {
    type(inputs()[0], '1');
    expect(document.activeElement).toBe(inputs()[1]);

    inputs()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(inputs()[0]);

    inputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(inputs()[1]);

    inputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(inputs()[1]);

    const last = inputs()[5];
    last.focus();
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(last);
  });

  it('clears the current digit on backspace and does nothing at the first empty input', () => {
    type(inputs()[0], '1');
    type(inputs()[1], '2');
    expect(fixture.componentInstance.value()).toBe('12');

    inputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();

    expect(inputs()[0].value).toBe('');
    expect(fixture.componentInstance.value()).toBe('2');

    inputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('2');
  });

  it('sanitizes alphanumeric pastes, uppercases, and truncates to the length', () => {
    fixture.componentInstance.pattern.set('alphanumeric');
    fixture.detectChanges();

    paste(inputs()[0], 'ab-12cd');

    expect(fixture.componentInstance.value()).toBe('AB12CD');
    expect(inputs().map((input) => input.value)).toEqual(['A', 'B', '1', '2', 'C', 'D']);
    expect(document.activeElement).toBe(inputs()[5]);

    paste(inputs()[0], 'xy9');
    expect(fixture.componentInstance.value()).toBe('XY9');
    expect(document.activeElement).toBe(inputs()[3]);
  });

  it('handles short, empty, and overflowing pastes', () => {
    paste(inputs()[0], '12');
    expect(fixture.componentInstance.value()).toBe('12');
    expect(document.activeElement).toBe(inputs()[2]);

    paste(inputs()[0], null);
    expect(fixture.componentInstance.value()).toBe('');
    expect(document.activeElement).toBe(inputs()[0]);

    paste(inputs()[0], '123456789');
    expect(fixture.componentInstance.value()).toBe('123456');
    expect(document.activeElement).toBe(inputs()[5]);
  });

  it('rejects non-numeric edits without losing the stored digit', () => {
    type(inputs()[0], '1');
    type(inputs()[0], 'a');

    expect(fixture.componentInstance.value()).toBe('1');
    expect(inputs()[0].value).toBe('1');

    type(inputs()[0], '9');
    expect(fixture.componentInstance.value()).toBe('9');
  });

  it('rebuilds the digits from writeValue when the length changes', () => {
    const cmp = fixture.debugElement.query(By.directive(UiInputOtp))
      .componentInstance as UiInputOtp;

    fixture.componentInstance.length.set(4);
    fixture.detectChanges();
    cmp.writeValue('123456');
    fixture.detectChanges();

    expect(inputs()).toHaveLength(4);
    expect(inputs().map((input) => input.value)).toEqual(['1', '2', '3', '4']);
    expect(fixture.componentInstance.value()).toBe('1234');

    cmp.writeValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('');
    expect(inputs().every((input) => input.value === '')).toBe(true);
  });

  it('reports touched on blur and supports setDisabledState', () => {
    const cmp = fixture.debugElement.query(By.directive(UiInputOtp))
      .componentInstance as UiInputOtp;
    const touched = vi.fn();
    cmp.registerOnTouched(touched);

    inputs()[0].dispatchEvent(new Event('blur', { bubbles: true }));
    expect(touched).toHaveBeenCalledTimes(1);

    cmp.setDisabledState(true);
    fixture.detectChanges();
    expect(inputs().every((input) => input.disabled)).toBe(true);

    cmp.setDisabledState(false);
    fixture.detectChanges();
    expect(inputs().every((input) => !input.disabled)).toBe(true);
  });

  it('reacts to length changes after initialization', () => {
    expect(inputs()).toHaveLength(6);

    fixture.componentInstance.length.set(4);
    fixture.detectChanges();
    expect(inputs()).toHaveLength(4);

    fixture.componentInstance.length.set(8);
    fixture.detectChanges();
    expect(inputs()).toHaveLength(8);
  });
});
