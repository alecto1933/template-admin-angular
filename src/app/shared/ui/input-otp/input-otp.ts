import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type OtpPattern = 'numeric' | 'alphanumeric';

/**
 * One-time password input with per-digit focus management, paste support,
 * optional separator, masking, and reactive form integration.
 *
 * <ui-input-otp [length]="6" [(value)]="code" />
 */
@Component({
  selector: 'ui-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputOtp),
      multi: true,
    },
  ],
  template: `
    <div
      class="ui-otp"
      role="group"
      [attr.aria-label]="ariaLabel()"
      [attr.data-invalid]="invalid() ? '' : null"
    >
      @for (char of chars(); track $index; let index = $index) {
        @if (separator() && index === separatorIndex()) {
          <span class="ui-otp-separator" aria-hidden="true">–</span>
        }
        <input
          #otpInput
          class="ui-otp-input"
          [type]="masked() ? 'password' : 'text'"
          [inputMode]="pattern() === 'numeric' ? 'numeric' : 'text'"
          maxlength="1"
          autocomplete="one-time-code"
          [value]="char"
          [disabled]="isDisabled()"
          [attr.aria-label]="'Digit ' + (index + 1)"
          (input)="onInput(index, $event)"
          (keydown)="onKeydown(index, $event)"
          (paste)="onPaste($event)"
          (focus)="$any($event.target).select()"
          (blur)="onTouchedFn()"
        />
      }
    </div>
  `,
})
export class UiInputOtp implements ControlValueAccessor {
  readonly length = input(6);
  readonly pattern = input<OtpPattern>('numeric');
  readonly separator = input(false, { transform: booleanAttribute });
  readonly masked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Kode verifikasi');
  readonly value = model('');

  protected readonly chars = signal<string[]>(Array.from({ length: this.length() }, () => ''));
  protected readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly separatorIndex = computed(() => Math.ceil(this.length() / 2));

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const text = (value ?? '').slice(0, this.length());
    const next = Array.from({ length: this.length() }, (_, index) => text[index] ?? '');
    this.chars.set(next);
    this.value.set(next.join(''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onTouchedFn(): void {
    this.onTouched();
  }

  protected onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const char = this.sanitize(input.value.slice(-1));

    if (!char) {
      input.value = this.chars()[index];
      return;
    }

    const next = [...this.chars()];
    next[index] = char;
    this.chars.set(next);
    this.emit();

    if (index < this.length() - 1) {
      this.inputs()[index + 1]?.nativeElement.focus();
    }
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const next = [...this.chars()];

      if (next[index]) {
        next[index] = '';
        this.chars.set(next);
        this.emit();
      } else if (index > 0) {
        next[index - 1] = '';
        this.chars.set(next);
        this.emit();
        this.inputs()[index - 1]?.nativeElement.focus();
      }

      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      this.inputs()[index - 1]?.nativeElement.focus();
      event.preventDefault();
    }

    if (event.key === 'ArrowRight' && index < this.length() - 1) {
      this.inputs()[index + 1]?.nativeElement.focus();
      event.preventDefault();
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = this.sanitize(event.clipboardData?.getData('text') ?? '');
    const next = Array.from({ length: this.length() }, (_, index) => text[index] ?? '');
    this.chars.set(next);
    this.emit();

    const target = Math.min(text.length, this.length() - 1);
    this.inputs()[target]?.nativeElement.focus();
  }

  private sanitize(text: string): string {
    if (this.pattern() === 'numeric') {
      return text.replace(/\D/g, '');
    }
    return text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  private emit(): void {
    const value = this.chars().join('');
    this.value.set(value);
    this.onChange(value);
  }
}
