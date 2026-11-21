import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppUpdateService } from '@/core/update/app-update.service';
import { TranslationService } from '@/core/i18n/translation.service';
import { UiButton } from '@/shared/ui/button/button';
import { UiIcon } from '@/shared/ui/icon/icon';

/**
 * Persistent notice shown when a newer deployment is detected.
 * Reloading is always the user's choice so unsaved work is not lost.
 */
@Component({
  selector: 'app-update-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiIcon],
  template: `
    @if (update.updateAvailable()) {
      <div
        class="fixed inset-x-3 bottom-3 z-[80] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px]"
        role="status"
        aria-live="polite"
      >
        <div class="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <ui-icon name="refresh-cw" class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-foreground">{{ t().updateTitle }}</p>
            <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
              {{ t().updateMessage }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button uiButton size="sm" type="button" (click)="update.reload()">
                {{ t().updateReload }}
              </button>
              <button uiButton size="sm" variant="ghost" type="button" (click)="update.dismiss()">
                {{ t().updateLater }}
              </button>
            </div>
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
