import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { UiIcon } from '../icon/icon';

export type CalendarMode = 'single' | 'multiple' | 'range';

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/**
 * Calendar with single, multiple, and range selection. Month/year selectors
 * are optional; all dates are handled locally with native Date.
 *
 * <ui-calendar mode="range" [(value)]="dates" />
 */
@Component({
  selector: 'ui-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        class="ui-calendar-nav"
        (click)="moveMonth(-1)"
        aria-label="Bulan sebelumnya"
      >
        <ui-icon name="chevron-left" class="size-4" />
      </button>

      <div class="flex flex-1 items-center justify-center gap-1.5">
        @if (showSelectors()) {
          <select
            uiSelect
            class="h-8 w-auto text-[13px]"
            [value]="currentMonth()"
            (change)="onMonthChange($event)"
            aria-label="Pilih bulan"
          >
            @for (month of months; track $index) {
              <option [value]="$index">{{ month }}</option>
            }
          </select>
          <select
            uiSelect
            class="h-8 w-auto text-[13px]"
            [value]="currentYear()"
            (change)="onYearChange($event)"
            aria-label="Pilih tahun"
          >
            @for (year of years; track year) {
              <option [value]="year">{{ year }}</option>
            }
          </select>
        } @else {
          <span class="font-display text-sm font-semibold">
            {{ monthName() }} {{ currentYear() }}
          </span>
        }
      </div>

      <button
        type="button"
        class="ui-calendar-nav"
        (click)="moveMonth(1)"
        aria-label="Bulan berikutnya"
      >
        <ui-icon name="chevron-right" class="size-4" />
      </button>
    </div>

    <div class="mt-3 grid grid-cols-7 gap-1">
      @for (weekday of weekdays; track weekday) {
        <span class="ui-calendar-weekday">{{ weekday }}</span>
      }

      @for (day of days(); track $index) {
        @if (day) {
          <button
            type="button"
            [class]="dayClasses(day)"
            [attr.aria-label]="dayLabel(day)"
            [attr.aria-pressed]="isSelected(day)"
            (click)="selectDay(day)"
          >
            {{ day.getDate() }}
          </button>
        } @else {
          <span></span>
        }
      }
    </div>
  `,
  host: { class: 'ui-calendar' },
})
export class UiCalendar {
  readonly mode = input<CalendarMode>('single');
  readonly showSelectors = input(false, { transform: booleanAttribute });
  readonly value = model<Date[]>([]);

  protected readonly months = MONTHS;
  protected readonly weekdays = WEEKDAYS;
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth());

  protected readonly years = Array.from(
    { length: 11 },
    (_, index) => new Date().getFullYear() - 5 + index,
  );

  protected readonly monthName = computed(() => MONTHS[this.currentMonth()]);

  protected readonly days = computed<(Date | null)[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: offset }, () => null);

    for (let day = 1; day <= total; day++) {
      cells.push(new Date(year, month, day));
    }

    while (cells.length < 42) {
      cells.push(null);
    }

    return cells;
  });

  protected moveMonth(delta: number): void {
    const date = new Date(this.currentYear(), this.currentMonth() + delta, 1);
    this.currentYear.set(date.getFullYear());
    this.currentMonth.set(date.getMonth());
  }

  protected onMonthChange(event: Event): void {
    this.currentMonth.set(Number((event.target as HTMLSelectElement).value));
  }

  protected onYearChange(event: Event): void {
    this.currentYear.set(Number((event.target as HTMLSelectElement).value));
  }

  protected selectDay(day: Date): void {
    const mode = this.mode();
    const current = this.value().map((date) => new Date(date));

    if (mode === 'single') {
      this.value.set([day]);
      return;
    }

    if (mode === 'multiple') {
      const exists = current.some((date) => this.sameDay(date, day));
      const next = exists ? current.filter((date) => !this.sameDay(date, day)) : [...current, day];
      next.sort((a, b) => a.getTime() - b.getTime());
      this.value.set(next);
      return;
    }

    if (current.length === 0 || current.length === 2) {
      this.value.set([day]);
      return;
    }

    const start = current[0];
    this.value.set(day.getTime() < start.getTime() ? [day, start] : [start, day]);
  }

  protected isSelected(day: Date): boolean {
    return this.value().some((date) => this.sameDay(date, day));
  }

  protected dayClasses(day: Date): string {
    const base = 'ui-calendar-day ';
    const selected = this.isSelected(day);
    const inRange = this.isInRange(day);
    const today = this.isToday(day);

    if (selected) {
      return base + 'bg-primary font-semibold text-primary-foreground';
    }
    if (inRange) {
      return base + 'bg-primary-soft text-primary';
    }
    if (today) {
      return base + 'border border-primary/40 text-foreground hover:bg-accent';
    }
    return base + 'text-foreground hover:bg-accent';
  }

  protected dayLabel(day: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(day);
  }

  private isInRange(day: Date): boolean {
    if (this.mode() !== 'range') {
      return false;
    }
    const [start, end] = this.value();
    if (!start || !end) {
      return false;
    }
    return day.getTime() > start.getTime() && day.getTime() < end.getTime();
  }

  private isToday(day: Date): boolean {
    const today = new Date();
    return this.sameDay(day, today);
  }

  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
