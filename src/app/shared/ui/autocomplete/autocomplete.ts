import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiIcon } from '../icon/icon';
import { IconName } from '../icon/icons';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface IndexedOption {
  option: AutocompleteOption;
  index: number;
}

interface OptionGroup {
  label: string;
  options: IndexedOption[];
}

/**
 * Accessible combobox built from scratch: filtering, keyboard navigation,
 * grouping, free-form text, async loading, and ControlValueAccessor support.
 *
 * <ui-autocomplete
 *   [options]="options"
 *   [(value)]="selected"
 *   [clearable]="true"
 *   placeholder="Cari..."
 * />
 */
@Component({
  selector: 'ui-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiAutocomplete),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <ui-icon
        [name]="leadingIcon()"
        class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />

      <input
        #input
        uiInput
        type="text"
        role="combobox"
        autocomplete="off"
        class="pr-10 pl-9"
        [id]="resolvedId()"
        [value]="query()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="open() && !isDisabled()"
        [attr.aria-controls]="listId"
        [attr.aria-autocomplete]="'list'"
        [attr.aria-activedescendant]="activeDescendant()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-busy]="loading() ? 'true' : null"
        (input)="onInput($any($event.target).value)"
        (focus)="onFocus()"
        (click)="onInputClick()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />

      <div class="absolute inset-y-0 right-2 flex items-center">
        @if (loading()) {
          <ui-icon name="loader-circle" class="size-4 animate-spin text-muted-foreground" />
        } @else if (showClear()) {
          <button
            type="button"
            class="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            (mousedown)="$event.preventDefault()"
            (click)="clear()"
            aria-label="Hapus pilihan"
          >
            <ui-icon name="x" class="size-3.5" />
          </button>
        }
      </div>
    </div>

    @if (open() && !isDisabled()) {
      <div
        class="ui-autocomplete-panel"
        [class.pointer-events-none]="flatOptions().length === 0"
        [id]="listId"
        role="listbox"
        [attr.aria-label]="ariaLabel() || placeholder()"
      >
        @if (loading() && flatOptions().length === 0) {
          <p class="ui-autocomplete-empty">Mencari…</p>
        } @else if (flatOptions().length === 0) {
          <p class="ui-autocomplete-empty">{{ emptyText() }}</p>
        } @else {
          @for (group of groups(); track group.label) {
            @if (group.label) {
              <p class="ui-autocomplete-group">{{ group.label }}</p>
            }

            @for (entry of group.options; track entry.option.value; let i = $index) {
              <button
                #optionEl
                type="button"
                role="option"
                class="ui-autocomplete-option"
                [id]="optionId(entry.index)"
                [attr.aria-selected]="entry.option.value === value()"
                [attr.aria-disabled]="entry.option.disabled ? 'true' : null"
                [attr.data-active]="activeIndex() === entry.index"
                [class.border-t]="separators() && i > 0"
                (mousedown)="$event.preventDefault()"
                (click)="select(entry.option)"
                (mouseenter)="activeIndex.set(entry.index)"
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] font-medium">
                    @for (part of labelParts(entry.option.label); track $index) {
                      @if (part.match) {
                        <mark class="ui-autocomplete-mark">{{ part.text }}</mark>
                      } @else {
                        {{ part.text }}
                      }
                    }
                  </span>
                  @if (entry.option.description) {
                    <span class="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {{ entry.option.description }}
                    </span>
                  }
                </span>

                @if (entry.option.value === value()) {
                  <ui-icon name="check" class="size-4 shrink-0 text-primary" />
                }
              </button>
            }
          }
        }
      </div>
    }
  `,
  host: { class: 'ui-autocomplete' },
})
export class UiAutocomplete implements ControlValueAccessor {
  private static nextId = 0;

  readonly options = input<AutocompleteOption[]>([]);
  readonly value = model('');
  readonly placeholder = input('Cari…');
  readonly inputId = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly emptyText = input('Tidak ada hasil');
  readonly leadingIcon = input<IconName>('search');

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly autoHighlight = input(false, { transform: booleanAttribute });
  readonly highlightMatch = input(false, { transform: booleanAttribute });
  readonly separators = input(false, { transform: booleanAttribute });
  readonly allowCustom = input(false, { transform: booleanAttribute });
  readonly filterLocally = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  readonly searchChange = output<string>();
  readonly optionSelected = output<AutocompleteOption>();

  protected readonly query = signal('');
  protected readonly searchTerm = signal('');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly focused = signal(false);
  protected readonly formDisabled = signal(false);

  private readonly uid = UiAutocomplete.nextId++;
  protected readonly listId = `ui-autocomplete-list-${this.uid}`;
  protected readonly resolvedId = computed(
    () => this.inputId() || `ui-autocomplete-input-${this.uid}`,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly showClear = computed(
    () =>
      this.clearable() &&
      !this.isDisabled() &&
      !this.loading() &&
      (this.query().length > 0 || this.value().length > 0),
  );

  private readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const options = this.options();

    if (!term || !this.filterLocally()) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(term));
  });

  protected readonly flatOptions = computed(() => this.filtered());

  protected readonly groups = computed<OptionGroup[]>(() => {
    const map = new Map<string, OptionGroup>();

    this.filtered().forEach((option, index) => {
      const key = option.group ?? '';
      let group = map.get(key);
      if (!group) {
        group = { label: option.group ?? '', options: [] };
        map.set(key, group);
      }
      group.options.push({ option, index });
    });

    return [...map.values()];
  });

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();
    return this.open() && index >= 0 && this.flatOptions()[index] ? this.optionId(index) : null;
  });

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly optionElements = viewChildren<ElementRef<HTMLButtonElement>>('optionEl');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Keep the visible text in sync when the value or options change while
    // the input is not focused (form patch, async options, etc.).
    effect(() => {
      const value = this.value();
      const options = this.options();
      if (!this.focused()) {
        this.query.set(this.labelFor(value, options));
      }
    });

    // Clamp the active option and apply auto-highlight.
    effect(() => {
      const options = this.flatOptions();
      const active = this.activeIndex();
      const isOpen = this.open();

      if (!isOpen) {
        return;
      }

      if (active >= options.length) {
        this.activeIndex.set(-1);
        return;
      }

      if (this.autoHighlight() && active < 0) {
        const first = options.findIndex((option) => !option.disabled);
        if (first >= 0) {
          this.activeIndex.set(first);
        }
      }
    });
  }

  writeValue(value: string | null): void {
    const next = value ?? '';
    this.value.set(next);
    this.query.set(this.labelFor(next, this.options()));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected labelParts(label: string): { text: string; match: boolean }[] {
    const term = this.searchTerm().trim();

    if (!this.highlightMatch() || !term) {
      return [{ text: label, match: false }];
    }

    const index = label.toLowerCase().indexOf(term.toLowerCase());
    if (index < 0) {
      return [{ text: label, match: false }];
    }

    return [
      { text: label.slice(0, index), match: false },
      { text: label.slice(index, index + term.length), match: true },
      { text: label.slice(index + term.length), match: false },
    ].filter((part) => part.text.length > 0);
  }

  protected onInput(text: string): void {
    this.query.set(text);
    this.searchTerm.set(text);
    this.open.set(true);
    this.activeIndex.set(-1);
    this.searchChange.emit(text);

    if (this.allowCustom()) {
      this.value.set(text);
      this.onChange(text);
    }
  }

  protected onFocus(): void {
    if (this.isDisabled()) {
      return;
    }
    this.focused.set(true);
    this.open.set(true);
    this.searchTerm.set('');
    this.activeIndex.set(-1);
  }

  protected onInputClick(): void {
    if (this.isDisabled() || this.open()) {
      return;
    }
    this.open.set(true);
    this.searchTerm.set('');
    this.activeIndex.set(-1);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.onTouched();
    this.open.set(false);
    this.activeIndex.set(-1);
    this.searchTerm.set('');

    if (this.allowCustom()) {
      const text = this.query().trim();
      this.value.set(text);
      this.query.set(text);
      this.onChange(text);
    } else {
      this.query.set(this.labelFor(this.value(), this.options()));
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
          this.activeIndex.set(-1);
        }
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
          this.activeIndex.set(-1);
        }
        this.moveActive(-1);
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.setActiveEdge('first');
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.setActiveEdge('last');
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.commitEnter();
        break;
      case 'Escape':
        event.preventDefault();
        this.open.set(false);
        this.activeIndex.set(-1);
        this.searchTerm.set('');
        if (!this.allowCustom()) {
          this.query.set(this.labelFor(this.value(), this.options()));
        }
        break;
      case 'Tab':
        this.open.set(false);
        this.activeIndex.set(-1);
        break;
      default:
        break;
    }
  }

  protected select(option: AutocompleteOption): void {
    if (option.disabled) {
      return;
    }

    this.value.set(option.value);
    this.query.set(option.label);
    this.searchTerm.set('');
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onChange(option.value);
    this.onTouched();
    this.optionSelected.emit(option);
  }

  protected clear(): void {
    this.value.set('');
    this.query.set('');
    this.searchTerm.set('');
    this.activeIndex.set(-1);
    this.open.set(true);
    this.onChange('');
    this.onTouched();
    this.searchChange.emit('');
    this.inputRef()?.nativeElement.focus();
  }

  private commitEnter(): void {
    const active = this.flatOptions()[this.activeIndex()];

    if (this.open() && active && !active.disabled) {
      this.select(active);
      return;
    }

    if (this.allowCustom()) {
      const text = this.query().trim();
      this.value.set(text);
      this.query.set(text);
      this.onChange(text);
      this.onTouched();
      this.open.set(false);
      return;
    }

    this.open.set(false);
    this.activeIndex.set(-1);
  }

  private moveActive(delta: 1 | -1): void {
    const options = this.flatOptions();
    const length = options.length;

    if (!length) {
      return;
    }

    let index = this.activeIndex();

    for (let step = 0; step < length; step++) {
      index = index < 0 ? (delta > 0 ? 0 : length - 1) : (index + delta + length) % length;

      if (!options[index].disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView(index);
        return;
      }
    }
  }

  private setActiveEdge(edge: 'first' | 'last'): void {
    const options = this.flatOptions();
    const indices =
      edge === 'first'
        ? options.map((_, index) => index)
        : options.map((_, index) => index).reverse();

    for (const index of indices) {
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView(index);
        return;
      }
    }
  }

  private scrollActiveIntoView(index: number): void {
    setTimeout(() => {
      this.optionElements()[index]?.nativeElement.scrollIntoView({
        block: 'nearest',
      });
    });
  }

  private labelFor(value: string, options: AutocompleteOption[]): string {
    return options.find((option) => option.value === value)?.label ?? value;
  }
}
