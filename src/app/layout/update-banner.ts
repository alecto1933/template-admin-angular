import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppUpdateService } from '@/core/update/app-update.service';
import { TranslationService } from '@/core/i18n/translation.service';
import { UiIcon } from '@/shared/ui/icon/icon';

/**
 * Full-width notice shown at the top when a newer deployment is detected.
 * Reloading is always the user's choice so unsaved work is not lost.
 */
@Component({
  selector: 'app-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiIcon],
  template: `
    @if (update.updateAvailable()) {
      <div
        class="fixed inset-x-0 top-0 z-[90] border-b border-success/40 bg-success text-white shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div
          class="mx-auto flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8"
        >
          <ui-icon name="refresh-cw" class="size-4 shrink-0" />
          <p class="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
            <span class="font-semibold">{{ t().updateTitle }}</span>
            <span class="block text-[11px] text-white/80 sm:ml-1 sm:inline">
              {{ t().updateMessage }}
            </span>
          </p>
          <div class="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              class="inline-flex h-8 cursor-pointer items-center rounded-lg bg-white px-3 text-xs font-semibold text-success transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              (click)="update.reload()"
            >
              {{ t().updateReload }}
            </button>
            <button
              type="button"
              class="inline-flex h-8 cursor-pointer items-center rounded-lg px-2.5 text-xs font-medium text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              (click)="update.dismiss()"
            >
              {{ t().updateLater }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AppUpdateBanner {
  protected readonly update = inject(AppUpdateService);
  private readonly i18n = inject(TranslationService);

  protected readonly t = this.i18n.layout;
}
