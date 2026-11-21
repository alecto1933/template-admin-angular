import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiAreaChart } from '@/shared/ui/charts/area-chart';

@Component({
  imports: [UiAreaChart],
  template: `
    <ui-area-chart
      id="chart"
      [data]="[0, 10]"
      [labels]="['Jan', 'Feb']"
      color="var(--chart-2)"
      ariaLabel="Penjualan"
    />
    <ui-area-chart id="empty" [data]="[]" />
  `,
})
class AreaChartHost {}

describe('UiAreaChart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AreaChartHost] }).compileComponents();
  });

  it('renders grid lines, an area path, and a line path from the data', () => {
    const fixture = TestBed.createComponent(AreaChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#chart') as HTMLElement;
    const svg = element.querySelector('svg') as SVGElement;
    const paths = svg.querySelectorAll('path');

    expect(svg.getAttribute('aria-label')).toBe('Penjualan');
    expect(svg.querySelectorAll('line').length).toBe(4);
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toContain('L 636 220 L 4 220 Z');
    expect(paths[0].getAttribute('fill')).toBe('var(--chart-2)');
    expect(paths[1].getAttribute('d')).toMatch(/^M 4 196 C /);
    expect(paths[1].getAttribute('stroke')).toBe('var(--chart-2)');
  });

  it('marks the last data point and renders labels', () => {
    const fixture = TestBed.createComponent(AreaChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#chart') as HTMLElement;
    const circles = element.querySelectorAll('circle');

    expect(circles.length).toBe(2);
    expect(circles[0].getAttribute('cx')).toBe('636');
    expect(circles[0].getAttribute('cy')).toBe('24');

    const labels = element.querySelectorAll('span');

    expect(Array.from(labels).map((label) => label.textContent?.trim())).toEqual(['Jan', 'Feb']);
  });

  it('renders empty paths when there is no data', () => {
    const fixture = TestBed.createComponent(AreaChartHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#empty') as HTMLElement;
    const paths = element.querySelectorAll('path');

    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toBeFalsy();
    expect(paths[1].getAttribute('d')).toBeFalsy();
    expect(element.querySelectorAll('circle').length).toBe(0);
  });
});
