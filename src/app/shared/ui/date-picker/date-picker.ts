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
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiButton } from '../button/button';
import { UiCalendar, CalendarMode } from '../calendar/calendar';
import { UiIcon } from '../icon/icon';

export type DateFormat = 'short' | 'long' | 'iso';

/**
 * Date picker built on top of <ui-calendar>, displayed inside a popover.
 * Supports single, multiple, and range selection plus reactive forms.
 *
 * <ui-date-picker mode="range" [(value)]="dates" />
 */
@Component({
  selector: 'ui-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiCalendar, UiButton, UiIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDatePicker),
      multi: true,
    },
  ],
  template: `
    <div class="ui-input-group cursor-pointer" (click)="toggle()">
      <span class="ui-input-group-addon">
        <ui-icon name="calendar" class="size-4" />
      </span>
      <input
        uiInput
        readonly
        class="cursor-pointer"
        [id]="inputId()"
        [value]="label()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
      />
      @if (label() && clearable() && !isDisabled()) {
        <button
          type="button"
          class="mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          (click)="clear($event)"
          aria-label="Hapus tanggal"
        >
          <ui-icon name="x" class="size-3.5" />
        </button>
      }
      <span class="ui-input-group-addon">
        <ui-icon name="chevron-down" class="size-4" />
      </span>
    </div>

    @if (open() && !isDisabled()) {
      <div
        class="absolute top-full left-0 z-50 mt-1.5 w-max rounded-xl border border-border bg-popover p-2 shadow-xl"
      >
        <ui-calendar
          [mode]="mode()"
          [showSelectors]="showSelectors()"
          [value]="value()"
          (valueChange)="onValueChange($event)"
        />
        <div class="mt-2 flex items-center justify-between border-t border-border pt-2">
          <button uiButton variant="ghost" size="sm" type="button" (click)="clear($event)">
            Hapus
          </button>
          <button uiButton size="sm" type="button" (click)="close()">Selesai</button>
        </div>
      </div>
    }
  `,
  host: {
    class: 'ui-date-picker',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UiDatePicker implements ControlValueAccessor {
  readonly mode = input<CalendarMode>('single');
  readonly showSelectors = input(false, { transform: booleanAttribute });
  readonly dateFormat = input<DateFormat>('short');
  readonly inputId = input('');
  readonly placeholder = input('Pilih tanggal…');
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly value = model<Date[]>([]);

  protected readonly open = signal(false);
  protected readonly formDisabled = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onChange: (value: Date[]) => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly label = computed(() => {
    const dates = this.value();

    if (!dates.length) {
      return '';
    }

    if (this.mode() === 'multiple') {
      return `${dates.length} tanggal dipilih`;
    }

    if (this.mode() === 'range') {
      return dates.map((date) => this.format(date)).join(' – ');
    }

    return this.format(dates[0]);
  });

  constructor() {}

  writeValue(value: Date[] | null): void {
    this.value.set(value ? [...value] : []);
  }

  registerOnChange(fn: (value: Date[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {
    // Touched state is not required for the demo.
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  protected toggle(): void {
    if (!this.isDisabled()) {
      this.open.update((open) => !open);
    }
  }

  protected close(): void {
    this.open.set(false);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.onValueChange([]);
    this.open.set(false);
  }

  protected onValueChange(dates: Date[]): void {
    this.value.set(dates);
    this.onChange(dates);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  private format(date: Date): string {
    const format = this.dateFormat();

    if (format === 'iso') {
      return new Intl.DateTimeFormat('sv-SE').format(date);
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      year: 'numeric',
    }).format(date);
  }
}
