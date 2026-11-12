import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  icon?: IconName;
  shortcut?: string;
  keywords?: string;
  disabled?: boolean;
}

interface IndexedCommand {
  item: CommandItem;
  index: number;
}

interface CommandGroup {
  label: string;
  items: IndexedCommand[];
}

/**
 * Searchable command list with keyboard navigation and grouping.
 *
 * <ui-command [items]="commands" (selected)="run($event)" />
 */
@Component({
  selector: 'ui-command',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <div class="ui-command">
      <div class="flex items-center gap-2 border-b border-border px-3">
        <ui-icon name="search" class="size-4 shrink-0 text-muted-foreground" />
        <input
          uiInput
          type="text"
          role="combobox"
          autocomplete="off"
          class="h-11 border-0 bg-transparent px-0 shadow-none focus:shadow-none"
          [placeholder]="placeholder()"
          [value]="query()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-controls]="listId"
          [attr.aria-expanded]="true"
          [attr.aria-activedescendant]="activeDescendant()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
        />
      </div>

      <div
        class="ui-command-list"
        role="listbox"
        [id]="listId"
        [style.max-height]="maxHeight() + 'px'"
      >
        @if (flat().length === 0) {
          <p class="ui-command-empty">{{ emptyText() }}</p>
        } @else {
          @for (group of groups(); track group.label) {
            @if (group.label) {
              <p class="ui-command-group">{{ group.label }}</p>
            }
            @for (entry of group.items; track entry.item.id) {
              <button
                #optionEl
                type="button"
                role="option"
                class="ui-command-item"
                [id]="optionId(entry.index)"
                [attr.data-active]="activeIndex() === entry.index"
                [attr.aria-disabled]="entry.item.disabled ? 'true' : null"
                (mouseenter)="activeIndex.set(entry.index)"
                (click)="select(entry.item)"
              >
                @if (entry.item.icon) {
                  <ui-icon [name]="entry.item.icon" class="size-4 shrink-0 text-muted-foreground" />
                }
                <span class="min-w-0 flex-1 truncate text-left">{{ entry.item.label }}</span>
                @if (entry.item.shortcut) {
                  <span class="ui-shortcut">{{ entry.item.shortcut }}</span>
                }
              </button>
            }
          }
        }
      </div>

      <div class="ui-command-footer">
        <span><kbd class="ui-command-kbd">↑</kbd><kbd class="ui-command-kbd">↓</kbd> navigasi</span>
        <span><kbd class="ui-command-kbd">↵</kbd> pilih</span>
      </div>
    </div>
  `,
})
export class UiCommand {
  private static nextId = 0;

  readonly items = input<CommandItem[]>([]);
  readonly placeholder = input('Cari perintah…');
  readonly emptyText = input('Tidak ada perintah ditemukan');
  readonly ariaLabel = input('Command palette');
  readonly maxHeight = input(320);

  readonly selected = output<CommandItem>();

  protected readonly listId = `ui-command-list-${UiCommand.nextId++}`;
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);

  private readonly optionEls = viewChildren<ElementRef<HTMLButtonElement>>('optionEl');

  protected readonly flat = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.items().filter(
      (item) =>
        !term ||
        item.label.toLowerCase().includes(term) ||
        item.keywords?.toLowerCase().includes(term),
    );
  });

  protected readonly groups = computed<CommandGroup[]>(() => {
    const map = new Map<string, CommandGroup>();

    this.flat().forEach((item, index) => {
      const key = item.group ?? '';
      let group = map.get(key);
      if (!group) {
        group = { label: item.group ?? '', items: [] };
        map.set(key, group);
      }
      group.items.push({ item, index });
    });

    return [...map.values()];
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();
    return index >= 0 && this.flat()[index] ? this.optionId(index) : null;
  });

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const item = this.flat()[this.activeIndex()];
        if (item) {
          this.select(item);
        }
        break;
      }
      case 'Escape':
        this.query.set('');
        this.activeIndex.set(-1);
        break;
      default:
        break;
    }
  }

  protected select(item: CommandItem): void {
    if (!item.disabled) {
      this.selected.emit(item);
    }
  }

  private move(delta: 1 | -1): void {
    const items = this.flat();
    if (!items.length) {
      return;
    }

    let index = this.activeIndex();
    for (let step = 0; step < items.length; step++) {
      index =
        index < 0
          ? delta > 0
            ? 0
            : items.length - 1
          : (index + delta + items.length) % items.length;

      if (!items[index].disabled) {
        this.activeIndex.set(index);
        setTimeout(() =>
          this.optionEls()[index]?.nativeElement.scrollIntoView({
            block: 'nearest',
          }),
        );
        return;
      }
    }
  }
}
