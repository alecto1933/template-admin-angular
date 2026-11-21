import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Renders text as per-letter stacks that roll up on `.group:hover`.
 * Pair with surface classes from the caller (font, size, color).
 */
@Component({
  selector: 'app-rolling-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (word of words(); track $index) {
      <span class="inline-block whitespace-nowrap">
        @for (letter of word.split(''); track $index) {
          <span class="inline-block h-[1.2em] overflow-hidden align-bottom">
            <span
              class="ui-letter-roll flex min-w-[4px] flex-col"
              [style.transition-delay.ms]="$index * 22"
            >
              <span class="leading-[1.2]">{{ letter }}</span>
              <span class="leading-[1.2]">{{ letter }}</span>
            </span>
          </span>
        }
      </span>
      <span class="inline-block w-2"></span>
    }
  `,
})
export class RollingTitle {
  readonly text = input.required<string>();

  protected readonly words = computed(() => this.text().split(' '));
}
