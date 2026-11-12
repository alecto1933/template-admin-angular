import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { UiIcon } from '../icon/icon';

export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom';

/**
 * Off-canvas panel built with fixed positioning and CSS transitions.
 *
 * <ui-drawer [(open)]="open" title="Filter" direction="right">
 *   ...content...
 *   <div drawerFooter>...</div>
 * </ui-drawer>
 */
@Component({
  selector: 'ui-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    <div
      class="ui-drawer-backdrop"
      [attr.data-open]="open()"
      (click)="close()"
      aria-hidden="true"
    ></div>

    <aside
      class="ui-drawer-panel"
      role="dialog"
      aria-modal="true"
      [attr.data-open]="open()"
      [attr.data-direction]="direction()"
      [attr.aria-label]="title()"
      [attr.aria-hidden]="!open()"
      [attr.inert]="open() ? null : ''"
    >
      <header class="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div class="min-w-0">
          <h2 class="font-display text-base font-semibold">{{ title() }}</h2>
          @if (description()) {
            <p class="mt-0.5 text-sm text-muted-foreground">{{ description() }}</p>
          }
        </div>
        <button
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          (click)="close()"
          aria-label="Tutup drawer"
        >
          <ui-icon name="x" class="size-4" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        <ng-content />
      </div>

      <footer class="ui-drawer-footer">
        <ng-content select="[drawerFooter]" />
      </footer>
    </aside>
  `,
  styles: `
    .ui-drawer-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      border-top: 1px solid var(--border);
      padding: 1rem 1.25rem;
    }

    .ui-drawer-footer:not(:has(*)) {
      display: none;
    }
  `,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class UiDrawer {
  readonly open = model(false);
  readonly title = input('Drawer');
  readonly description = input('');
  readonly direction = input<DrawerDirection>('right');

  close(): void {
    this.open.set(false);
  }

  protected onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }
}
