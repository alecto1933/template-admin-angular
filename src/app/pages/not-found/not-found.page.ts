import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/i18n/translation.service';
import { NOT_FOUND_TEXTS } from '../../core/i18n/not-found.texts';
import { UiButton } from '../../shared/ui/button/button';
import { UiIcon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiIcon],
  template: `
    <div class="ui-fade-up flex flex-col items-center py-16 text-center sm:py-24">
      <span
        class="relative grid size-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/25"
      >
        <ui-icon name="search" class="size-8" />
      </span>

      <p
        class="mt-8 font-display text-[72px] leading-none font-bold tracking-tight text-primary sm:text-[96px]"
      >
        404
      </p>
      <h1 class="mt-3 font-display text-2xl font-bold tracking-tight">{{ t().title }}</h1>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {{ t().description }}
      </p>

      <div class="mt-7 flex flex-wrap items-center justify-center gap-2">
        <button uiButton (click)="goHome()">
          <ui-icon name="home" class="size-4" />
          {{ t().goHome }}
        </button>
        <button uiButton variant="outline" (click)="goBack()">
          <ui-icon name="arrow-left" class="size-4" />
          {{ t().goBack }}
        </button>
      </div>

    </div>
  `,
})
export class NotFoundPage {
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly t = computed(() => NOT_FOUND_TEXTS[this.i18n.lang()]);

  protected goHome(): void {
    this.router.navigate(['/home']);
  }

  protected goBack(): void {
    history.back();
  }

}
