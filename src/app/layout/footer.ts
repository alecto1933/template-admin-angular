import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-sidebar-border bg-sidebar px-4 py-3 md:px-6 md:py-4 lg:px-8">
      <div
        class="flex w-full flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs"
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
