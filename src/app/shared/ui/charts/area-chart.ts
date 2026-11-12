import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface ChartPoint {
  x: number;
  y: number;
}

/**
 * Dependency-free area chart. The numbers are scaled to a fixed viewBox and
 * the SVG stretches responsively; non-scaling strokes stay crisp.
 */
@Component({
  selector: 'ui-area-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <svg
        viewBox="0 0 640 220"
        class="h-52 w-full sm:h-60"
        preserveAspectRatio="none"
        role="img"
        [attr.aria-label]="ariaLabel()"
      >
        @for (line of gridLines; track line) {
          <line
            x1="0"
            [attr.y1]="line"
            x2="640"
            [attr.y2]="line"
            stroke="var(--border)"
            stroke-dasharray="3 7"
            vector-effect="non-scaling-stroke"
          />
        }

        <path [attr.d]="areaPath()" [attr.fill]="color()" fill-opacity="0.12" />

        <path
          [attr.d]="linePath()"
          fill="none"
          [attr.stroke]="color()"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />

        @if (lastPoint(); as point) {
          <circle
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="8"
            [attr.fill]="color()"
            opacity="0.16"
          />
          <circle
            [attr.cx]="point.x"
            [attr.cy]="point.y"
            r="3.5"
            fill="var(--card)"
            [attr.stroke]="color()"
            stroke-width="2.5"
            vector-effect="non-scaling-stroke"
          />
        }
      </svg>

      @if (labels().length) {
        <div
          class="mt-2 flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground"
        >
          @for (label of labels(); track $index) {
            <span>{{ label }}</span>
          }
        </div>
      }
    </div>
  `,
})
export class UiAreaChart {
  readonly data = input.required<number[]>();
  readonly labels = input<string[]>([]);
  readonly color = input('var(--chart-1)');
  readonly ariaLabel = input('Grafik tren');

  protected readonly gridLines = [40, 85, 130, 175];

  private readonly points = computed<ChartPoint[]>(() => {
    const values = this.data();
    if (!values.length) {
      return [];
    }

    const top = 24;
    const bottom = 196;
    const left = 4;
    const right = 636;
    const max = Math.max(...values, 1);
    const step = values.length > 1 ? (right - left) / (values.length - 1) : 0;

    return values.map((value, index) => ({
      x: left + step * index,
      y: bottom - (value / max) * (bottom - top),
    }));
  });

  protected readonly linePath = computed(() => this.smoothPath(this.points()));

  protected readonly areaPath = computed(() => {
    const points = this.points();
    if (!points.length) {
      return '';
    }

    const line = this.linePath();
    const first = points[0];
    const last = points[points.length - 1];
    return `${line} L ${last.x} 220 L ${first.x} 220 Z`;
  });

  protected readonly lastPoint = computed(() => {
    const points = this.points();
    return points.length ? points[points.length - 1] : null;
  });

  private smoothPath(points: ChartPoint[]): string {
    if (!points.length) {
      return '';
    }
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 0; index < points.length - 1; index++) {
      const previous = points[index - 1] ?? points[index];
      const current = points[index];
      const next = points[index + 1];
      const after = points[index + 2] ?? next;

      const control1X = current.x + (next.x - previous.x) / 6;
      const control1Y = current.y + (next.y - previous.y) / 6;
      const control2X = next.x - (after.x - current.x) / 6;
      const control2Y = next.y - (after.y - current.y) / 6;

      path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${next.x} ${next.y}`;
    }

    return path;
  }
}
