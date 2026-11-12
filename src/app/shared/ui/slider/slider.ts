import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Range slider with one or multiple thumbs, ticks, vertical orientation,
 * disabled state, and reactive form support.
 *
 * <ui-slider [(value)]="[25, 75]" [showTicks]="true" />
 */
@Component({
  selector: 'ui-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSlider),
      multi: true,
    },
  ],
  template: `
    <div
      class="ui-slider"
      [attr.data-vertical]="vertical() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [attr.data-draggable]="draggableRange() ? '' : null"
      [attr.data-draggable-only]="draggableRangeOnly() ? '' : null"
    >
      <div class="ui-slider-track"></div>
      <div
        class="ui-slider-fill"
        [style.left.%]="vertical() ? null : fillStart()"
        [style.right.%]="vertical() ? null : 100 - fillEnd()"
        [style.bottom.%]="vertical() ? fillStart() : null"
        [style.height.%]="vertical() ? fillEnd() - fillStart() : null"
        (pointerdown)="onRangePointerDown($event)"
        (pointermove)="onRangePointerMove($event)"
        (pointerup)="onRangePointerUp($event)"
        (pointercancel)="onRangePointerUp($event)"
      ></div>

      @for (thumb of values(); track $index; let index = $index) {
        <input
          class="ui-slider-input"
          type="range"
          [attr.id]="index === 0 ? inputId() : null"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="thumb"
          [disabled]="isDisabled()"
          [attr.aria-label]="ariaLabel() + ' ' + (index + 1)"
          (input)="onInput(index, $event)"
        />
      }

      @if (showTicks()) {
        @for (tick of ticks(); track tick) {
          <span
            class="ui-slider-tick"
            [style.left.%]="vertical() ? null : percent(tick)"
            [style.bottom.%]="vertical() ? percent(tick) : null"
          ></span>
          @if (tickLabels()) {
            <span class="ui-slider-tick-label" [style.left.%]="vertical() ? null : percent(tick)">
              {{ tick }}
            </span>
          }
        }
      }
    </div>
  `,
})
export class UiSlider implements ControlValueAccessor {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly value = model<number[]>([0]);
  readonly vertical = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showTicks = input(false, { transform: booleanAttribute });
  readonly tickLabels = input(false, { transform: booleanAttribute });
  readonly tickCount = input(5);
  readonly minDistance = input(0);
  readonly inputId = input('');
  readonly ariaLabel = input('Slider');
  readonly draggableRange = input(false, { transform: booleanAttribute });
  readonly draggableRangeOnly = input(false, { transform: booleanAttribute });

  private readonly formDisabled = signal(false);
  private onChange: (value: number[]) => void = () => {};
  private onTouched: () => void = () => {};
  private dragState: {
    pointerId: number;
    startX: number;
    startY: number;
    values: number[];
    rect: DOMRect;
    target: HTMLElement;
  } | null = null;

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly values = computed(() => {
    const values = [...this.value()].sort((a, b) => a - b);
    return values.length ? values : [this.min()];
  });

  protected readonly fillStart = computed(() =>
    this.values().length > 1 ? this.percent(this.values()[0]) : 0,
  );

  protected readonly fillEnd = computed(() =>
    this.percent(this.values()[this.values().length - 1]),
  );

  protected readonly ticks = computed(() => {
    const count = Math.max(2, this.tickCount());
    const range = this.max() - this.min();
    return Array.from({ length: count }, (_, index) =>
      Math.round(this.min() + (range / (count - 1)) * index),
    );
  });

  writeValue(value: number[] | null): void {
    this.value.set(value?.length ? [...value] : [this.min()]);
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected percent(value: number): number {
    return ((value - this.min()) / (this.max() - this.min())) * 100;
  }

  protected onInput(index: number, event: Event): void {
    const next = [...this.values()];
    let value = Number((event.target as HTMLInputElement).value);
    const distance = this.minDistance();

    if (next.length > 1 && distance > 0) {
      if (index === 0) {
        value = Math.min(value, next[1] - distance);
      } else {
        value = Math.max(value, next[0] + distance);
      }
    }

    next[index] = Math.min(this.max(), Math.max(this.min(), value));
    this.commit(next);
  }

  protected onRangePointerDown(event: PointerEvent): void {
    if (this.isDisabled() || (!this.draggableRange() && !this.draggableRangeOnly())) {
      return;
    }

    const values = this.values();
    if (values.length < 2) {
      return;
    }

    const container = (event.currentTarget as HTMLElement).closest('.ui-slider');
    if (!(container instanceof HTMLElement)) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    this.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      values: [...values],
      rect: container.getBoundingClientRect(),
      target,
    };
    target.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  protected onRangePointerMove(event: PointerEvent): void {
    const state = this.dragState;
    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    const span = this.max() - this.min();
    const delta = this.vertical()
      ? ((state.startY - event.clientY) / state.rect.height) * span
      : ((event.clientX - state.startX) / state.rect.width) * span;

    let low = state.values[0] + delta;
    let high = state.values[state.values.length - 1] + delta;

    if (low < this.min()) {
      high += this.min() - low;
      low = this.min();
    }
    if (high > this.max()) {
      low -= high - this.max();
      high = this.max();
    }

    const next = [...state.values];
    next[0] = this.snap(low);
    next[next.length - 1] = this.snap(high);
    this.commit(next);
  }

  protected onRangePointerUp(event: PointerEvent): void {
    const state = this.dragState;
    if (!state) {
      return;
    }
    if (state.target.hasPointerCapture(event.pointerId)) {
      state.target.releasePointerCapture(event.pointerId);
    }
    this.dragState = null;
  }

  private snap(value: number): number {
    const step = this.step() || 1;
    const snapped = Math.round((value - this.min()) / step) * step + this.min();
    return Math.min(this.max(), Math.max(this.min(), snapped));
  }

  private commit(next: number[]): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
