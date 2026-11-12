import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  contentChildren,
  inject,
  input,
  signal,
  TemplateRef,
  viewChildren,
} from '@angular/core';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';

/**
 * Declares a tab panel. The content only renders while the tab is active.
 *
 * <ui-tabs>
 *   <ng-template uiTab label="Umum">...</ng-template>
 *   <ng-template uiTab label="Keamanan" icon="shield-check">...</ng-template>
 * </ui-tabs>
 */
@Directive({ selector: 'ng-template[uiTab]' })
export class UiTab {
  readonly label = input.required<string>();
  readonly icon = input<IconName | undefined>(undefined);
  readonly template = inject(TemplateRef<unknown>);
}

@Component({
  selector: 'ui-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, UiIcon],
  template: `
    <div class="flex flex-col gap-5">
      <div
        class="ui-tablist max-w-full self-start overflow-x-auto"
        role="tablist"
        [attr.aria-label]="ariaLabel()"
        (keydown)="onKeydown($event)"
      >
        @for (tab of tabs(); track tab.label(); let index = $index) {
          <button
            #tabButton
            type="button"
            class="ui-tab"
            role="tab"
            [id]="tabId(index)"
            [attr.aria-selected]="active() === index"
            [attr.aria-controls]="panelId(index)"
            [attr.tabindex]="active() === index ? 0 : -1"
            [attr.data-active]="active() === index"
            (click)="active.set(index)"
          >
            @if (tab.icon(); as icon) {
              <ui-icon [name]="icon" class="size-4" />
            }
            {{ tab.label() }}
          </button>
        }
      </div>

      <div
        class="outline-none"
        role="tabpanel"
        [id]="panelId(active())"
        [attr.aria-labelledby]="tabId(active())"
        tabindex="0"
      >
        @if (tabs()[active()]; as tab) {
          <ng-container *ngTemplateOutlet="tab.template" />
        }
      </div>
    </div>
  `,
})
export class UiTabs {
  private static nextId = 0;

  readonly ariaLabel = input('Tab');
  readonly active = signal(0);
  readonly tabs = contentChildren(UiTab);

  private readonly id = UiTabs.nextId++;
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected tabId(index: number): string {
    return `ui-tab-${this.id}-${index}`;
  }

  protected panelId(index: number): string {
    return `ui-tab-panel-${this.id}-${index}`;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs().length;
    if (!count) {
      return;
    }

    let next = this.active();
    switch (event.key) {
      case 'ArrowRight':
        next = (next + 1) % count;
        break;
      case 'ArrowLeft':
        next = (next - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.active.set(next);
    this.buttons()[next]?.nativeElement.focus();
  }
}
