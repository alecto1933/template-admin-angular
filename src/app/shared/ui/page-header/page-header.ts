import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0 space-y-1.5">
        <h1
          class="font-display text-[26px] leading-tight font-bold tracking-tight text-foreground sm:text-[30px]"
        >
          {{ title() }}
        </h1>
        @if (description()) {
          <p class="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {{ description() }}
          </p>
        }
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <ng-content />
      </div>
    </header>
  `,
})
export class UiPageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
