import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 120 40" class="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="areaPath()" [attr.fill]="color()" opacity="0.12" />
      <path
        [attr.d]="linePath()"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `,
})
export class UiSparkline {
  readonly data = input.required<number[]>();
  readonly color = input('var(--chart-1)');

  private readonly points = computed(() => {
    const values = this.data();
    if (!values.length) {
      return [];
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const step = values.length > 1 ? 120 / (values.length - 1) : 0;

    return values.map((value, index) => ({
      x: index * step,
      y: 36 - ((value - min) / span) * 30,
    }));
  });

  protected readonly linePath = computed(() =>
    this.points()
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' '),
  );

  protected readonly areaPath = computed(() => {
    const points = this.points();
    if (!points.length) {
      return '';
    }
    return `${this.linePath()} L 120 40 L 0 40 Z`;
  });
}
