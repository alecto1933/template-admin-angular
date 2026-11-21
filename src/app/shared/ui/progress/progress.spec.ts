import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressSize, UiProgress } from '@/shared/ui/progress/progress';

@Component({
  imports: [UiProgress],
  template: `
    <ui-progress
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [indeterminate]="indeterminate()"
    />
  `,
})
class ProgressHost {
  readonly value = signal(40);
  readonly max = signal(100);
  readonly size = signal<ProgressSize>('md');
  readonly indeterminate = signal(false);
}

describe('UiProgress', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgressHost] }).compileComponents();
  });

  it('renders an accessible progressbar with the current value', () => {
    const fixture = TestBed.createComponent(ProgressHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const progress = host.querySelector('[role="progressbar"]') as HTMLElement;
    const bar = host.querySelector('.ui-progress-bar') as HTMLElement;

    expect(progress).toBeTruthy();
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.getAttribute('aria-valuenow')).toBe('40');
    expect(progress.getAttribute('aria-valuetext')).toBe('40%');
    expect(progress.getAttribute('data-size')).toBe('md');
    expect(bar.style.width).toBe('40%');
    expect(bar.classList.contains('ui-progress-indeterminate')).toBe(false);
  });

  it('updates width and aria when value changes, and drops valuenow when indeterminate', () => {
    const fixture = TestBed.createComponent(ProgressHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const progress = host.querySelector('[role="progressbar"]') as HTMLElement;
    const bar = host.querySelector('.ui-progress-bar') as HTMLElement;

    component.value.set(75);
    component.size.set('lg');
    fixture.detectChanges();

    expect(progress.getAttribute('aria-valuenow')).toBe('75');
    expect(progress.getAttribute('aria-valuetext')).toBe('75%');
    expect(progress.getAttribute('data-size')).toBe('lg');
    expect(bar.style.width).toBe('75%');

    component.indeterminate.set(true);
    fixture.detectChanges();

    expect(progress.hasAttribute('aria-valuenow')).toBe(false);
    expect(progress.getAttribute('aria-valuetext')).toBe('Memuat');
    expect(bar.classList.contains('ui-progress-indeterminate')).toBe(true);
    expect(bar.style.width).toBe('');
  });

  it('scales the bar against max and reports the computed percentage', () => {
    const fixture = TestBed.createComponent(ProgressHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.max.set(200);
    component.value.set(100);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const progress = host.querySelector('[role="progressbar"]') as HTMLElement;
    const bar = host.querySelector('.ui-progress-bar') as HTMLElement;

    expect(progress.getAttribute('aria-valuemax')).toBe('200');
    expect(progress.getAttribute('aria-valuenow')).toBe('100');
    expect(progress.getAttribute('aria-valuetext')).toBe('50%');
    expect(bar.style.width).toBe('50%');
  });

  it('clamps the percentage between 0 and 100', () => {
    const fixture = TestBed.createComponent(ProgressHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.max.set(50);
    component.value.set(75);
    fixture.detectChanges();

    const bar = (fixture.nativeElement as HTMLElement).querySelector(
      '.ui-progress-bar',
    ) as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });
});
