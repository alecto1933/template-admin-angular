import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

export type ResizableOrientation = 'horizontal' | 'vertical';

/**
 * Two-panel resizable layout with a draggable keyboard-accessible handle.
 *
 * <ui-resizable [(size)]="size">
 *   <div resizableStart>...</div>
 *   <div resizableEnd>...</div>
 * </ui-resizable>
 */
@Component({
  selector: 'ui-resizable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-resizable" #container [attr.data-orientation]="orientation()">
      <div class="ui-resizable-panel" [style.flex-basis.%]="size()">
        <ng-content select="[resizableStart]" />
      </div>

      <div
        class="ui-resizable-handle"
        role="separator"
        tabindex="0"
        [attr.aria-orientation]="orientation() === 'horizontal' ? 'vertical' : 'horizontal'"
        [attr.aria-valuenow]="size()"
        aria-valuemin="20"
        aria-valuemax="80"
        [attr.aria-label]="ariaLabel()"
        (pointerdown)="startDrag($event)"
        (keydown)="onKeydown($event)"
      ></div>

      <div class="ui-resizable-panel min-w-0 flex-1">
        <ng-content select="[resizableEnd]" />
      </div>
    </div>
  `,
  host: {
    '(document:pointermove)': 'onPointerMove($event)',
    '(document:pointerup)': 'onPointerUp()',
    '(document:pointercancel)': 'onPointerUp()',
  },
})
export class UiResizable {
  readonly orientation = input<ResizableOrientation>('horizontal');
  readonly size = model(50);
  readonly min = input(20);
  readonly max = input(80);
  readonly ariaLabel = input('Ubah ukuran panel');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly dragging = signal(false);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  protected startDrag(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging() || this.disabled()) {
      return;
    }

    const rect = this.container().nativeElement.getBoundingClientRect();
    const percent =
      this.orientation() === 'horizontal'
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100;

    this.setSize(percent);
  }

  protected onPointerUp(): void {
    this.dragging.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 2;
    let delta = 0;

    if (this.orientation() === 'horizontal') {
      if (event.key === 'ArrowLeft') delta = -step;
      if (event.key === 'ArrowRight') delta = step;
    } else {
      if (event.key === 'ArrowUp') delta = -step;
      if (event.key === 'ArrowDown') delta = step;
    }

    if (!delta) {
      return;
    }

    event.preventDefault();
    this.setSize(this.size() + delta);
  }

  private setSize(value: number): void {
    this.size.set(Math.min(this.max(), Math.max(this.min(), value)));
  }
}
