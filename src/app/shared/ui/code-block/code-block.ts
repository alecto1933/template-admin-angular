import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  signal,
} from '@angular/core';
import { UiIcon } from '../icon/icon';

export type CodeBlockSize = 'sm' | 'md' | 'lg';

interface CodeLine {
  number: number;
  content: string;
  highlight: boolean;
  diff: 'add' | 'remove' | 'none';
}

/**
 * Code viewer with optional header, copy action, line numbers, highlighting,
 * diff colors, wrapping, max height, sizes, and destructive styling.
 */
@Component({
  selector: 'ui-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <div
      class="ui-code-block"
      [attr.data-size]="size()"
      [attr.data-destructive]="destructive() ? '' : null"
    >
      @if (showHeader()) {
        <div class="ui-code-block-header">
          <div class="flex min-w-0 items-center gap-2">
            <ui-icon name="file-text" class="size-3.5 text-muted-foreground" />
            <span class="truncate font-mono text-[11px] font-semibold">
              {{ title() || language() }}
            </span>
            @if (language()) {
              <span
                class="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase"
              >
                {{ language() }}
              </span>
            }
          </div>
          @if (showActions() && !floatingActions()) {
            <button
              type="button"
              class="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              (click)="copy()"
              [attr.aria-label]="copied() ? 'Tersalin' : 'Salin kode'"
            >
              <ui-icon [name]="copied() ? 'check' : 'copy'" class="size-3.5" />
            </button>
          }
        </div>
      }

      <div class="relative">
        <div
          class="ui-code-block-scroll"
          [style.max-height]="maxHeight() ? maxHeight() + 'px' : null"
        >
          <pre
            [class.whitespace-pre-wrap]="wrap()"
          ><code>@for (line of lines(); track $index) {<span
  class="ui-code-line"
  [attr.data-highlight]="line.highlight ? '' : null"
  [attr.data-diff]="line.diff"
>@if (showLineNumbers()) {<span class="ui-code-line-number">{{ line.number }}</span>}<span class="ui-code-line-text">{{ line.content || ' ' }}</span></span>}</code></pre>
        </div>

        @if (floatingActions()) {
          <button
            type="button"
            class="absolute top-2 right-2 grid size-7 place-items-center rounded-md border border-border bg-card/90 text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
            (click)="copy()"
            [attr.aria-label]="copied() ? 'Tersalin' : 'Salin kode'"
          >
            <ui-icon [name]="copied() ? 'check' : 'copy'" class="size-3.5" />
          </button>
        }
      </div>
    </div>
  `,
})
export class UiCodeBlock {
  readonly code = input.required<string>();
  readonly language = input('ts');
  readonly title = input('');
  readonly showHeader = input(false, { transform: booleanAttribute });
  readonly showActions = input(true, { transform: booleanAttribute });
  readonly floatingActions = input(false, { transform: booleanAttribute });
  readonly showLineNumbers = input(false, { transform: booleanAttribute });
  readonly startLine = input(1);
  readonly wrap = input(false, { transform: booleanAttribute });
  readonly highlightLines = input<number[]>([]);
  readonly maxHeight = input(0);
  readonly size = input<CodeBlockSize>('md');
  readonly destructive = input(false, { transform: booleanAttribute });

  protected readonly copied = signal(false);

  protected readonly lines = computed<CodeLine[]>(() =>
    this.code()
      .split('\n')
      .map((content, index) => ({
        number: this.startLine() + index,
        content,
        highlight: this.highlightLines().includes(this.startLine() + index),
        diff: content.startsWith('+') ? 'add' : content.startsWith('-') ? 'remove' : 'none',
      })),
  );

  protected copy(): void {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    });
  }
}
