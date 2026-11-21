import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/i18n/translation.service';
import { ThemeService } from './core/theme/theme.service';
import { UiToaster } from './shared/ui/toast/toaster';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, UiToaster],
  template: `
    <a
      href="#main"
      class="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
    >
      {{ t().skipToContent }}
    </a>
    <router-outlet />
    <ui-toaster />
  `,
})
export class App {
  // Instantiated early so the saved theme is applied before the shell renders.
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(TranslationService);

  protected readonly t = this.i18n.layout;
}
