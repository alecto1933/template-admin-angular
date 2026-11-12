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
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiIcon } from '../icon/icon';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  disabled?: boolean;
}

interface IndexedSelectOption {
  option: SelectOption;
  index: number;
}

interface SelectGroup {
  label: string;
  options: IndexedSelectOption[];
}

/**
 * Select with single/multiple selection, groups, placeholder, disabled,
 * invalid, object values, and reactive form support.
 */
@Component({
  selector: 'ui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelect),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      class="ui-select-trigger"
      role="combobox"
      [id]="inputId()"
      [attr.data-open]="open() ? '' : null"
      [attr.data-invalid]="invalid() ? '' : null"
      [disabled]="isDisabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listId"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
    >
      @if (multiple() && selectedOptions().length) {
        <span class="flex min-w-0 flex-wrap gap-1">
          @for (option of selectedOptions(); track option.value) {
            <span class="ui-select-chip">
              {{ option.label }}
              <span
                class="grid size-3.5 cursor-pointer place-items-center rounded-sm opacity-70 hover:opacity-100"
                (click)="remove(option.value, $event)"
                role="button"
                tabindex="0"
                [attr.aria-label]="'Hapus ' + option.label"
              >
                <ui-icon name="x" class="size-3" />
              </span>
            </span>
          }
        </span>
      } @else {
        <span class="truncate" [class.text-muted-foreground]="!displayLabel()">
          {{ displayLabel() || placeholder() }}
        </span>
      }

      @if (clearable() && selectedOptions().length && !isDisabled()) {
        <span
          class="ml-auto grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          (click)="clear($event)"
          role="button"
          tabindex="0"
          aria-label="Hapus pilihan"
        >
          <ui-icon name="x" class="size-3.5" />
        </span>
      } @else {
        <ui-icon name="chevron-down" class="ml-auto size-4 shrink-0 text-muted-foreground" />
      }
    </button>

    @if (open() && !isDisabled()) {
      <div
        class="ui-select-panel"
        role="listbox"
        [id]="listId"
        [attr.aria-multiselectable]="multiple()"
        [style.max-height]="maxHeight() ? maxHeight() + 'px' : null"
      >
        @for (group of groups(); track group.label) {
          @if (group.label) {
            <p class="ui-select-group">{{ group.label }}</p>
          }
          @for (entry of group.options; track entry.option.value) {
            <button
              type="button"
              role="option"
              class="ui-select-option"
              [attr.aria-selected]="isSelected(entry.option.value)"
              [attr.aria-disabled]="entry.option.disabled ? 'true' : null"
              [attr.data-active]="activeIndex() === entry.index"
              (mouseenter)="activeIndex.set(entry.index)"
              (click)="select(entry.option)"
            >
              <span
                class="ui-select-check"
                [attr.data-checked]="isSelected(entry.option.value) ? '' : null"
              >
                @if (isSelected(entry.option.value)) {
                  <ui-icon name="check" class="size-3" />
                }
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[13px] font-medium">{{ entry.option.label }}</span>
                @if (entry.option.description) {
                  <span class="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {{ entry.option.description }}
                  </span>
                }
              </span>
            </button>
          }
        }
      </div>
    }
  `,
  host: {
    class: 'ui-select',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UiSelect implements ControlValueAccessor {
  private static nextId = 0;

  readonly options = input<SelectOption[]>([]);
  readonly value = model<string | string[]>('');
  readonly placeholder = input('Pilih opsi…');
  readonly inputId = input('');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly maxHeight = input(0);

  protected readonly listId = `ui-select-list-${UiSelect.nextId++}`;
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly formDisabled = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onChange: (value: string | string[]) => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly selectedValues = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value : value ? [value] : [];
  });

  protected readonly selectedOptions = computed(() =>
    this.selectedValues()
      .map((value) => this.options().find((option) => option.value === value))
      .filter((option): option is SelectOption => !!option),
  );

  protected readonly displayLabel = computed(() =>
    this.multiple() ? '' : (this.selectedOptions()[0]?.label ?? ''),
  );

  protected readonly groups = computed<SelectGroup[]>(() => {
    const map = new Map<string, SelectGroup>();
    this.options().forEach((option, index) => {
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

  writeValue(value: string | string[] | null): void {
    this.value.set(Array.isArray(value) ? [...value] : (value ?? ''));
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {}

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.open.set(false);
    }
  }

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.open.update((open) => !open);
  }

  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  protected select(option: SelectOption): void {
    if (option.disabled) {
      return;
    }

    if (this.multiple()) {
      const selected = this.selectedValues();
      const next = selected.includes(option.value)
        ? selected.filter((value) => value !== option.value)
        : [...selected, option.value];
      this.value.set(next);
      this.onChange(next);
      return;
    }

    this.value.set(option.value);
    this.onChange(option.value);
    this.open.set(false);
  }

  protected remove(value: string, event: Event): void {
    event.stopPropagation();
    const next = this.selectedValues().filter((item) => item !== value);
    this.value.set(next);
    this.onChange(next);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    const next = this.multiple() ? [] : '';
    this.value.set(next);
    this.onChange(next);
    this.open.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
      this.move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Enter' && this.open()) {
      event.preventDefault();
      const option = this.options()[this.activeIndex()];
      if (option) {
        this.select(option);
      }
    }

    if (event.key === 'Escape') {
      this.open.set(false);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  private move(delta: 1 | -1): void {
    const options = this.options();
    if (!options.length) {
      return;
    }
    let index = this.activeIndex();
    for (let step = 0; step < options.length; step++) {
      index =
        index < 0
          ? delta > 0
            ? 0
            : options.length - 1
          : (index + delta + options.length) % options.length;
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }
}
