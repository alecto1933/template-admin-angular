import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiSlider } from '@/shared/ui/slider/slider';

@Component({
  imports: [UiSlider],
  template: `
    <ui-slider
      [value]="value()"
      (valueChange)="value.set($event)"
      [min]="min()"
      [max]="max()"
      [minDistance]="minDistance()"
      [showTicks]="showTicks()"
      [tickCount]="tickCount()"
      [tickLabels]="tickLabels()"
      [step]="step()"
      [vertical]="vertical()"
      [draggableRange]="draggableRange()"
      [draggableRangeOnly]="draggableRangeOnly()"
      [inputId]="inputId()"
      ariaLabel="Nilai"
      [disabled]="disabled()"
    />
  `,
})
class SliderHost {
  readonly value = signal<number[]>([30]);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly minDistance = signal(0);
  readonly showTicks = signal(false);
  readonly tickCount = signal(5);
  readonly tickLabels = signal(false);
  readonly step = signal(1);
  readonly vertical = signal(false);
  readonly draggableRange = signal(false);
  readonly draggableRangeOnly = signal(false);
  readonly inputId = signal('');
  readonly disabled = signal(false);
}

function pointer(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, ...init });
}

function setRect(element: HTMLElement, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect;
}

describe('UiSlider', () => {
  beforeEach(async () => {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn(() => true);
    await TestBed.configureTestingModule({ imports: [SliderHost] }).compileComponents();
  });

  it('renders one range input per value with fill and aria labels', () => {
    const fixture = TestBed.createComponent(SliderHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const inputs = host.querySelectorAll<HTMLInputElement>('.ui-slider-input');
    const fill = host.querySelector('.ui-slider-fill') as HTMLElement;

    expect(inputs.length).toBe(1);
    expect(inputs[0].min).toBe('0');
    expect(inputs[0].max).toBe('100');
    expect(inputs[0].value).toBe('30');
    expect(inputs[0].getAttribute('aria-label')).toBe('Nilai 1');
    expect(fill.style.left).toBe('0%');
    expect(fill.style.right).toBe('70%');
  });

  it('updates the model when a thumb input fires', () => {
    const fixture = TestBed.createComponent(SliderHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('.ui-slider-input') as HTMLInputElement;
    const fill = host.querySelector('.ui-slider-fill') as HTMLElement;

    input.value = '65';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toEqual([65]);
    expect(fill.style.right).toBe('35%');
  });

  it('clamps multi-thumb values using minDistance', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.value.set([20, 80]);
    component.minDistance.set(10);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const inputs = host.querySelectorAll<HTMLInputElement>('.ui-slider-input');

    expect(inputs.length).toBe(2);
    expect(inputs[0].value).toBe('20');
    expect(inputs[1].value).toBe('80');

    inputs[0].value = '95';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toEqual([70, 80]);
  });

  it('renders ticks when enabled and disables the inputs', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.showTicks.set(true);
    component.tickCount.set(5);
    component.disabled.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const ticks = host.querySelectorAll('.ui-slider-tick');
    const input = host.querySelector('.ui-slider-input') as HTMLInputElement;

    expect(ticks.length).toBe(5);
    expect(input.disabled).toBe(true);
    expect(host.querySelector('.ui-slider')?.hasAttribute('data-disabled')).toBe(true);
  });

  it('clamps the upper thumb with minDistance and ignores out-of-range input', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.value.set([20, 80]);
    component.minDistance.set(10);
    fixture.detectChanges();

    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      '.ui-slider-input',
    );

    inputs[1].value = '5';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toEqual([20, 30]);

    inputs[0].value = '-50';
    inputs[0].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toEqual([0, 30]);

    inputs[1].value = '500';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toEqual([0, 100]);
  });

  it('renders tick labels, applies the input id, and handles vertical ticks', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.showTicks.set(true);
    component.tickLabels.set(true);
    component.tickCount.set(1);
    component.inputId.set('volume');
    component.vertical.set(true);
    component.value.set([25, 75]);
    component.min.set(10);
    component.max.set(90);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.ui-slider-tick').length).toBe(2);
    const labels = host.querySelectorAll<HTMLElement>('.ui-slider-tick-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent?.trim()).toBe('10');
    const ticks = host.querySelectorAll<HTMLElement>('.ui-slider-tick');
    expect(ticks[0].style.bottom).toBe('0%');
    expect(ticks[1].style.bottom).toBe('100%');
    expect(host.querySelector('.ui-slider')?.hasAttribute('data-vertical')).toBe(true);
    expect(host.querySelector<HTMLInputElement>('.ui-slider-input')?.id).toBe('volume');
    expect(host.querySelector<HTMLElement>('.ui-slider-fill')?.style.height).toBe('62.5%');
  });

  it('drags both thumbs horizontally and snaps to the step', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.value.set([20, 80]);
    component.draggableRange.set(true);
    component.step.set(10);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const slider = host.querySelector<HTMLElement>('.ui-slider')!;
    const fill = host.querySelector<HTMLElement>('.ui-slider-fill')!;
    setRect(slider, { width: 100, height: 100 });

    fill.dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 50 }));
    fixture.detectChanges();
    expect(Element.prototype.setPointerCapture).toHaveBeenCalled();

    // Wrong pointer id is ignored.
    fill.dispatchEvent(pointer('pointermove', { pointerId: 2, clientX: 90 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([20, 80]);

    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 72 }));
    fixture.detectChanges();
    // +22 snapped to 40 and the high end clamps at max.
    expect(component.value()).toEqual([40, 100]);

    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 0 }));
    fixture.detectChanges();
    // -50 shifts both thumbs and clamps the low end at min.
    expect(component.value()).toEqual([0, 60]);

    fill.dispatchEvent(pointer('pointerup', { pointerId: 1 }));
    fixture.detectChanges();
    expect(Element.prototype.releasePointerCapture).toHaveBeenCalled();

    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 80 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([0, 60]);
  });

  it('drags vertically and supports draggableRangeOnly', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    component.value.set([20, 80]);
    component.vertical.set(true);
    component.draggableRangeOnly.set(true);
    component.step.set(5);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const slider = host.querySelector<HTMLElement>('.ui-slider')!;
    const fill = host.querySelector<HTMLElement>('.ui-slider-fill')!;
    setRect(slider, { width: 100, height: 100 });

    fill.dispatchEvent(pointer('pointerdown', { pointerId: 5, clientY: 50 }));
    fill.dispatchEvent(pointer('pointermove', { pointerId: 5, clientY: 80 }));
    fixture.detectChanges();

    // Moving down by 30% subtracts 30: low clamps at 0, high becomes 60.
    expect(component.value()).toEqual([0, 60]);

    // Pointer up without an active capture still resets the drag state.
    vi.mocked(Element.prototype.hasPointerCapture).mockReturnValue(false);
    fill.dispatchEvent(pointer('pointerup', { pointerId: 5 }));
    fixture.detectChanges();
    fill.dispatchEvent(pointer('pointermove', { pointerId: 5, clientY: 10 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([0, 60]);
  });

  it('ignores range dragging when disabled, not draggable, or single-valued', () => {
    const fixture = TestBed.createComponent(SliderHost);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const fill = host.querySelector<HTMLElement>('.ui-slider-fill')!;

    // Not draggable.
    fill.dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 10 }));
    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 90 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([30]);

    // Draggable but only one thumb.
    component.draggableRange.set(true);
    fixture.detectChanges();
    fill.dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 10 }));
    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 90 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([30]);

    // Disabled with two thumbs.
    component.value.set([20, 80]);
    component.disabled.set(true);
    fixture.detectChanges();
    fill.dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 10 }));
    fill.dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 90 }));
    fixture.detectChanges();
    expect(component.value()).toEqual([20, 80]);

    // Range pointer up without a drag state is a no-op.
    fill.dispatchEvent(pointer('pointerup', { pointerId: 1 }));
  });

  it('supports CVA writeValue and setDisabledState', () => {
    const fixture = TestBed.createComponent(SliderHost);
    fixture.detectChanges();
    const cmp = fixture.debugElement.query(By.directive(UiSlider)).componentInstance as UiSlider;

    cmp.writeValue(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([0]);

    cmp.writeValue([10, 20]);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([10, 20]);

    cmp.setDisabledState(true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('.ui-slider-input')
        ?.disabled,
    ).toBe(true);
  });
});
