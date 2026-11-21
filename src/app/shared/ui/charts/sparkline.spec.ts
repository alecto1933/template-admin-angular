import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiSparkline } from '@/shared/ui/charts/sparkline';

@Component({
  imports: [UiSparkline],
  template: `
    <ui-sparkline id="trend" [data]="[0, 10]" color="var(--chart-3)" />
    <ui-sparkline id="flat" [data]="[5, 5, 5]" />
    <ui-sparkline id="empty" [data]="[]" />
  `,
})
class SparklineHost {}

describe('UiSparkline', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SparklineHost] }).compileComponents();
  });

  it('renders a line and area path scaled to the data', () => {
    const fixture = TestBed.createComponent(SparklineHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#trend') as HTMLElement;
    const paths = element.querySelectorAll('path');

    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toBe('M 0 36 L 120 6 L 120 40 L 0 40 Z');
    expect(paths[0].getAttribute('fill')).toBe('var(--chart-3)');
    expect(paths[1].getAttribute('d')).toBe('M 0 36 L 120 6');
    expect(paths[1].getAttribute('stroke')).toBe('var(--chart-3)');
    expect(element.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a flat line when all values are equal', () => {
    const fixture = TestBed.createComponent(SparklineHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#flat') as HTMLElement;
    const line = element.querySelectorAll('path')[1];

    expect(line.getAttribute('d')).toBe('M 0 36 L 60 36 L 120 36');
  });

  it('renders empty paths for empty data', () => {
    const fixture = TestBed.createComponent(SparklineHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#empty') as HTMLElement;
    const paths = element.querySelectorAll('path');

    expect(paths[0].getAttribute('d')).toBeFalsy();
    expect(paths[1].getAttribute('d')).toBeFalsy();
  });
});
