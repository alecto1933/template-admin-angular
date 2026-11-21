import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '@/core/i18n/translation.service';
import { UiButton } from '@/shared/ui/button/button';
import { UiIcon } from '@/shared/ui/icon/icon';

@Component({
  selector: 'app-remote-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiIcon],
  template: `
    <section class="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 text-center">
      <ui-icon name="triangle-alert" class="mx-auto size-8 text-destructive" />
      <h1 class="mt-3 font-display text-lg font-semibold">{{ t().remoteErrorTitle }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ t().remoteErrorMessage }}</p>
      <button uiButton type="button" class="mt-4" (click)="retry()">
        {{ t().remoteRetry }}
      </button>
    </section>
  `,
})
export class RemoteErrorPage {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly t = this.i18n.layout;

  protected retry(): void {
    void this.router.navigate(['/profile-management'], { queryParams: { retry: Date.now() } });
  }
}
