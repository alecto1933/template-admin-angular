import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'ui-donut-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative size-44">
      <svg viewBox="0 0 120 120" class="size-full -rotate-90">
        <circle cx="60" cy="60" r="46" fill="none" stroke="var(--muted)" stroke-width="13" />
        @for (segment of segments(); track segment.label) {
          <circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            [attr.stroke]="segment.color"
            stroke-width="13"
            stroke-linecap="round"
            [attr.stroke-dasharray]="segment.dash"
            [attr.stroke-dashoffset]="segment.offset"
          />
        }
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <ng-content />
      </div>
    </div>
  `,
})
export class UiDonutChart {
  readonly segmentsInput = input<DonutSegment[]>([], { alias: 'segments' });

  private readonly circumference = 2 * Math.PI * 46;

  protected readonly segments = computed(() => {
    const items = this.segmentsInput();
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
    let travelled = 0;

    return items.map((item) => {
      const fraction = item.value / total;
      const length = Math.max(fraction * this.circumference - 4, 2);
      const offset = -travelled * this.circumference;
      travelled += fraction;

      return {
        ...item,
        dash: `${length} ${this.circumference - length}`,
        offset,
      };
    });
  });
}
