import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { UiIcon } from '../icon/icon';

/**
 * Accordion item. Content is projected and animated with a CSS grid row
 * transition, so the height animates without measuring anything in JS.
 *
 * <ui-accordion>
 *   <ui-accordion-item title="Judul">Isi panel.</ui-accordion-item>
 * </ui-accordion>
 */
@Component({
  selector: 'ui-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <h3 class="flex">
      <button
        type="button"
        class="ui-accordion-trigger"
        [id]="triggerId"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="contentId"
        [disabled]="disabled()"
        (click)="toggle()"
      >
        <span class="min-w-0 flex-1 text-left">{{ title() }}</span>
        <ui-icon name="chevron-down" class="ui-accordion-chevron size-4 shrink-0" />
      </button>
    </h3>

    <div
      class="ui-accordion-content"
      role="region"
      [id]="contentId"
      [attr.aria-labelledby]="triggerId"
      [attr.data-state]="open() ? 'open' : 'closed'"
      [attr.inert]="open() ? null : ''"
    >
      <div class="ui-accordion-content-inner">
        <div class="ui-accordion-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'ui-accordion-item',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class UiAccordionItem {
  private static nextId = 0;

  readonly title = input.required<string>();
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly id = UiAccordionItem.nextId++;
  protected readonly triggerId = `ui-accordion-trigger-${this.id}`;
  protected readonly contentId = `ui-accordion-content-${this.id}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    if (this.open()) {
      this.open.set(false);
      this.emit('ui-accordion-item-close');
    } else {
      this.open.set(true);
      this.emit('ui-accordion-item-open');
    }
  }

  /** Bubbling DOM events keep projected items in sync with the parent. */
  private emit(name: string): void {
    this.host.nativeElement.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
  }
}

@Component({
  selector: 'ui-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    class: 'ui-accordion',
    '(ui-accordion-item-open)': 'onItemOpen($event)',
    '(ui-accordion-item-close)': 'onItemClose($event)',
  },
})
export class UiAccordion {
  readonly type = input<'single' | 'multiple'>('single');
  readonly collapsible = input(true);

  private readonly items = contentChildren(UiAccordionItem);

  constructor() {
    // If a single accordion starts with several open items, keep the first.
    afterNextRender(() => {
      if (this.type() !== 'single') {
        return;
      }
      const opened = this.items().filter((item) => item.open());
      opened.slice(1).forEach((item) => item.open.set(false));
    });
  }

  protected onItemOpen(event: Event): void {
    const item = (event as CustomEvent<UiAccordionItem>).detail;

    if (!this.items().includes(item) || this.type() === 'multiple') {
      return;
    }

    for (const sibling of this.items()) {
      if (sibling !== item) {
        sibling.open.set(false);
      }
    }
  }

  protected onItemClose(event: Event): void {
    const item = (event as CustomEvent<UiAccordionItem>).detail;

    if (!this.items().includes(item) || this.type() === 'multiple' || this.collapsible()) {
      return;
    }

    // A non-collapsible accordion always keeps one panel open.
    item.open.set(true);
  }
}
