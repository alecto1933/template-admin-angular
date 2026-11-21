import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiResizable } from '@/shared/ui/resizable/resizable';

@Component({
  imports: [UiResizable],
  template: `
    <ui-resizable
      [size]="size()"
      (sizeChange)="size.set($event)"
      [orientation]="orientation()"
      [min]="min()"
      [max]="max()"
      [ariaLabel]="ariaLabel()"
      [disabled]="disabled()"
    >
      <div resizableStart>Panel kiri</div>
      <div resizableEnd>Panel kanan</div>
    </ui-resizable>
  `,
})
class ResizableHost {
  readonly size = signal(50);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly min = signal(20);
  readonly max = signal(80);
  readonly ariaLabel = signal('Ubah ukuran panel');
  readonly disabled = signal(false);
}

function setRect(element: HTMLElement, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect;
}

describe('UiResizable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ResizableHost] }).compileComponents();
  });

  it('renders both panels and an accessible separator', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const handle = host.querySelector('.ui-resizable-handle') as HTMLElement;

    expect(host.textContent).toContain('Panel kiri');
    expect(host.textContent).toContain('Panel kanan');
    expect(handle).toBeTruthy();
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('tabindex')).toBe('0');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuenow')).toBe('50');
    expect(handle.getAttribute('aria-valuemin')).toBe('20');
    expect(handle.getAttribute('aria-valuemax')).toBe('80');
  });

  it('resizes via keyboard and clamps within min/max', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const handle = fixture.nativeElement.querySelector('.ui-resizable-handle') as HTMLElement;

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(component.size()).toBe(52);
    expect(handle.getAttribute('aria-valuenow')).toBe('52');

    for (let i = 0; i < 20; i++) {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
    }
    fixture.detectChanges();

    expect(component.size()).toBe(80);
    expect(handle.getAttribute('aria-valuenow')).toBe('80');

    for (let i = 0; i < 20; i++) {
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
    }
    fixture.detectChanges();

    expect(component.size()).toBe(20);
  });

  it('resizes vertically with arrow keys and ignores unrelated keys', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    const component = fixture.componentInstance;
    component.orientation.set('vertical');
    component.min.set(10);
    component.max.set(90);
    component.ariaLabel.set('Ubah tinggi');
    fixture.detectChanges();

    const handle = fixture.nativeElement.querySelector('.ui-resizable-handle') as HTMLElement;
    expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
    expect(handle.getAttribute('aria-valuemin')).toBe('10');
    expect(handle.getAttribute('aria-valuemax')).toBe('90');
    expect(handle.getAttribute('aria-label')).toBe('Ubah tinggi');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.size()).toBe(52);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', shiftKey: true }));
    fixture.detectChanges();
    expect(component.size()).toBe(42);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    fixture.detectChanges();
    expect(component.size()).toBe(42);
  });

  it('resizes by dragging horizontally on the document and stops on pointer up', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector<HTMLElement>('.ui-resizable')!;
    const handle = host.querySelector<HTMLElement>('.ui-resizable-handle')!;
    setRect(container, { width: 200 });

    // Moving before dragging starts is ignored.
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 80 }));
    fixture.detectChanges();
    expect(component.size()).toBe(50);

    handle.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 60 }));
    fixture.detectChanges();
    expect(component.size()).toBe(30);

    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 300 }));
    fixture.detectChanges();
    expect(component.size()).toBe(80);

    document.dispatchEvent(new MouseEvent('pointerup'));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 10 }));
    fixture.detectChanges();
    expect(component.size()).toBe(80);

    document.dispatchEvent(new MouseEvent('pointercancel'));
    fixture.detectChanges();
    expect(component.size()).toBe(80);
  });

  it('resizes by dragging vertically and clamps to custom bounds', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    const component = fixture.componentInstance;
    component.orientation.set('vertical');
    component.min.set(10);
    component.max.set(60);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector<HTMLElement>('.ui-resizable')!;
    const handle = host.querySelector<HTMLElement>('.ui-resizable-handle')!;
    setRect(container, { height: 100 });

    handle.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientY: 40 }));
    fixture.detectChanges();
    expect(component.size()).toBe(40);

    document.dispatchEvent(new MouseEvent('pointermove', { clientY: 90 }));
    fixture.detectChanges();
    expect(component.size()).toBe(60);

    document.dispatchEvent(new MouseEvent('pointermove', { clientY: 0 }));
    fixture.detectChanges();
    expect(component.size()).toBe(10);
    document.dispatchEvent(new MouseEvent('pointerup'));
  });

  it('does not start dragging when disabled', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    const component = fixture.componentInstance;
    component.disabled.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector<HTMLElement>('.ui-resizable')!;
    const handle = host.querySelector<HTMLElement>('.ui-resizable-handle')!;
    setRect(container, { width: 200 });

    handle.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 0 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 160 }));
    fixture.detectChanges();

    expect(component.size()).toBe(50);
    document.dispatchEvent(new MouseEvent('pointerup'));
  });

  it('ignores keyboard resizing while disabled', () => {
    const fixture = TestBed.createComponent(ResizableHost);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.disabled.set(true);
    fixture.detectChanges();

    const handle = fixture.nativeElement.querySelector('.ui-resizable-handle') as HTMLElement;
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(component.size()).toBe(50);
  });
});
