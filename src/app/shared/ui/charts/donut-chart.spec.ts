import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DonutSegment, UiDonutChart } from '@/shared/ui/charts/donut-chart';

@Component({
  imports: [UiDonutChart],
  template: `
    <ui-donut-chart id="donut" [segments]="segments()">
      <span class="donut-total">120</span>
    </ui-donut-chart>
  `,
})
class DonutChartHost {
  readonly segments = signal<DonutSegment[]>([
    { label: 'Penjualan', value: 75, color: 'var(--chart-1)' },
    { label: 'Lainnya', value: 25, color: 'var(--chart-2)' },
  ]);
}

describe('UiDonutChart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DonutChartHost] }).compileComponents();
  });

  it('renders a background ring plus one circle per segment', () => {
    const fixture = TestBed.createComponent(DonutChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#donut') as HTMLElement;
    const circles = element.querySelectorAll('circle');

    expect(circles.length).toBe(3);
    expect(circles[0].getAttribute('stroke')).toBe('var(--muted)');
    expect(circles[1].getAttribute('stroke')).toBe('var(--chart-1)');
    expect(circles[2].getAttribute('stroke')).toBe('var(--chart-2)');
  });

  it('sizes and offsets each segment from its share of the total', () => {
    const fixture = TestBed.createComponent(DonutChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#donut') as HTMLElement;
    const circles = element.querySelectorAll('circle');
    const circumference = 2 * Math.PI * 46;
    const expectedLength = 0.75 * circumference - 4;

    expect(circles[1].getAttribute('stroke-dasharray')).toBe(
      `${expectedLength} ${circumference - expectedLength}`,
    );
    expect(circles[1].getAttribute('stroke-dashoffset')).toBe('0');
    expect(Number(circles[2].getAttribute('stroke-dashoffset'))).toBeCloseTo(-0.75 * circumference);
  });

  it('projects center content and falls back safely for zero totals', () => {
    const fixture = TestBed.createComponent(DonutChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#donut') as HTMLElement;

    expect(element.querySelector('.donut-total')?.textContent?.trim()).toBe('120');

    fixture.componentInstance.segments.set([
      { label: 'Kosong', value: 0, color: 'var(--chart-3)' },
    ]);
    fixture.detectChanges();

    const dash = element.querySelectorAll('circle')[1].getAttribute('stroke-dasharray');
    const [length, remainder] = (dash ?? '').split(' ').map(Number);

    expect(length).toBe(2);
    expect(remainder).toBeCloseTo(2 * Math.PI * 46 - 2);
  });
});
