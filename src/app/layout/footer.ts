import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-sidebar-border bg-sidebar px-4 py-4 md:px-6 lg:px-8">
      <div
        class="mx-auto flex w-full max-w-[1400px] flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ year }} iVendor Superapps.</p>
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span
            class="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] font-medium"
          >
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  `,
})
export class AppFooter {
  protected readonly year = new Date().getFullYear();
}
