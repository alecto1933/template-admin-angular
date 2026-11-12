import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteOption } from '../autocomplete/autocomplete';
import { UiIcon } from '../icon/icon';

interface IndexedMulti {
  option: AutocompleteOption;
  index: number;
}

interface MultiGroup {
  label: string;
  options: IndexedMulti[];
}

/**
 * Multiple-selection combobox with chips, search, groups, and async support.
 *
 * <ui-multi-combobox [options]="options" [(value)]="selected" />
 */
@Component({
  selector: 'ui-multi-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiMultiCombobox),
      multi: true,
    },
  ],
  template: `
    <div
      class="ui-multi-control"
      [attr.data-invalid]="invalid() ? '' : null"
      (click)="focusInput()"
    >
      @for (option of selectedOptions(); track option.value) {
        <span class="ui-multi-chip">
          {{ option.label }}
          <button
            type="button"
            (click)="remove(option.value, $event)"
            [attr.aria-label]="'Hapus ' + option.label"
          >
            <ui-icon name="x" class="size-3" />
          </button>
        </span>
      }

      <input
        #searchInput
        class="ui-multi-input"
        type="text"
        [id]="inputId()"
        [value]="query()"
        [placeholder]="selectedOptions().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        [attr.aria-expanded]="open()"
        aria-autocomplete="list"
        role="combobox"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="activeDescendant()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
      />

      @if (loading()) {
        <ui-icon name="loader-circle" class="size-4 shrink-0 animate-spin text-muted-foreground" />
      } @else if (showClear()) {
        <button
          type="button"
          class="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          (click)="clear($event)"
          aria-label="Hapus semua pilihan"
        >
          <ui-icon name="x" class="size-3.5" />
        </button>
      } @else {
        <ui-icon name="chevron-down" class="size-4 shrink-0 text-muted-foreground" />
      }
    </div>

    @if (open() && !isDisabled()) {
      <div class="ui-multi-panel" role="listbox" [id]="listId" aria-multiselectable="true">
        @if (flat().length === 0) {
          <p class="px-3 py-6 text-center text-xs text-muted-foreground">
            {{ loading() ? 'Mencari…' : emptyText() }}
          </p>
        } @else {
          @for (group of groups(); track group.label) {
            @if (group.label) {
              <p
                class="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                {{ group.label }}
              </p>
            }
            @for (entry of group.options; track entry.option.value) {
              <button
                type="button"
                role="option"
                class="ui-multi-option"
                [id]="optionId(entry.index)"
                [attr.aria-selected]="isSelected(entry.option.value)"
                [attr.data-active]="activeIndex() === entry.index"
                (mouseenter)="activeIndex.set(entry.index)"
                (click)="toggle(entry.option)"
              >
                <span
                  class="ui-multi-check"
                  [attr.data-checked]="isSelected(entry.option.value) ? '' : null"
                >
                  @if (isSelected(entry.option.value)) {
                    <ui-icon name="check" class="size-3" />
                  }
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] font-medium">{{
                    entry.option.label
                  }}</span>
                  @if (entry.option.description) {
                    <span class="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {{ entry.option.description }}
                    </span>
                  }
                </span>
              </button>
            }
          }
        }
      </div>
    }
  `,
  host: {
    class: 'ui-multi-combobox',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UiMultiCombobox implements ControlValueAccessor {
  private static nextId = 0;

  readonly options = input<AutocompleteOption[]>([]);
  readonly value = model<string[]>([]);
  readonly placeholder = input('Pilih opsi…');
  readonly inputId = input('');
  readonly emptyText = input('Tidak ada hasil');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly filterLocally = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly autoHighlight = input(false, { transform: booleanAttribute });

  readonly searchChange = output<string>();

  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly formDisabled = signal(false);

  protected readonly listId = `ui-multi-list-${UiMultiCombobox.nextId++}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private onChange: (value: string[]) => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly showClear = computed(
    () => this.clearable() && this.value().length > 0 && !this.loading(),
  );

  protected readonly selectedOptions = computed(() =>
    this.value()
      .map((value) => this.options().find((option) => option.value === value))
      .filter((option): option is AutocompleteOption => !!option),
  );

  private readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term || !this.filterLocally()) {
      return this.options();
    }
    return this.options().filter((option) => option.label.toLowerCase().includes(term));
  });

  protected readonly flat = computed(() => this.filtered());

  protected readonly groups = computed<MultiGroup[]>(() => {
    const map = new Map<string, MultiGroup>();
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
    return this.open() && index >= 0 && this.flat()[index] ? this.optionId(index) : null;
  });

  writeValue(value: string[] | null): void {
    this.value.set(value ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {}

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected focusInput(): void {
    if (this.isDisabled()) {
      return;
    }
    this.open.set(true);
  }

  protected onFocus(): void {
    if (this.isDisabled()) {
      return;
    }
    this.open.set(true);
    this.searchChange.emit(this.query());
    if (this.autoHighlight() && this.activeIndex() < 0) {
      this.activeIndex.set(0);
    }
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.open.set(true);
    this.activeIndex.set(-1);
    this.searchChange.emit(text);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
      this.move(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Enter') {
      const option = this.flat()[this.activeIndex()];
      if (option) {
        event.preventDefault();
        this.toggle(option);
      }
    }

    if (event.key === 'Escape') {
      this.open.set(false);
    }
  }

  protected toggle(option: AutocompleteOption): void {
    const selected = this.value();
    const next = selected.includes(option.value)
      ? selected.filter((value) => value !== option.value)
      : [...selected, option.value];
    this.value.set(next);
    this.onChange(next);
    this.query.set('');
    this.searchChange.emit('');
  }

  protected remove(value: string, event: Event): void {
    event.stopPropagation();
    const next = this.value().filter((item) => item !== value);
    this.value.set(next);
    this.onChange(next);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set([]);
    this.query.set('');
    this.onChange([]);
    this.searchChange.emit('');
    this.open.set(true);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  private move(delta: 1 | -1): void {
    const items = this.flat();
    if (!items.length) {
      return;
    }
    let index = this.activeIndex();
    index =
      index < 0
        ? delta > 0
          ? 0
          : items.length - 1
        : (index + delta + items.length) % items.length;
    this.activeIndex.set(index);
  }
}
