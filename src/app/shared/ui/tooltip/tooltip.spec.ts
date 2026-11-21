import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipPosition, UiTooltip } from '@/shared/ui/tooltip/tooltip';

@Component({
  imports: [UiTooltip],
  template: `
    <span class="group relative inline-flex">
      <button type="button">Info</button>
      <ui-tooltip [position]="position()" [disabled]="disabled()">Keterangan bantuan</ui-tooltip>
    </span>
  `,
})
class TooltipHost {
  readonly position = signal<TooltipPosition>('top');
  readonly disabled = signal(false);
}

describe('UiTooltip', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TooltipHost] }).compileComponents();
  });

  it('renders tooltip content with position and enabled state', () => {
    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();

    const tooltip = fixture.nativeElement.querySelector('ui-tooltip') as HTMLElement;

    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('Keterangan bantuan');
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.getAttribute('data-position')).toBe('top');
    expect(tooltip.hasAttribute('data-disabled')).toBe(false);
  });

  it('reflects position changes and the disabled attribute', () => {
    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const tooltip = fixture.nativeElement.querySelector('ui-tooltip') as HTMLElement;

    component.position.set('bottom-end');
    component.disabled.set(true);
    fixture.detectChanges();

    expect(tooltip.getAttribute('data-position')).toBe('bottom-end');
    expect(tooltip.getAttribute('data-disabled')).toBe('');

    component.disabled.set(false);
    fixture.detectChanges();

    expect(tooltip.hasAttribute('data-disabled')).toBe(false);
  });
});
