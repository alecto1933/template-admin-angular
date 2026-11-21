import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { AppFooter } from '@/layout/footer';
import { AppSidebar } from '@/layout/sidebar';
import { AppTopbar } from '@/layout/topbar';
import { UiSpinner } from '@/shared/ui/spinner/spinner';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppSidebar, AppTopbar, AppFooter, UiSpinner],
  template: `
    <div class="flex h-dvh overflow-hidden bg-background">
      <app-sidebar
        [collapsed]="collapsed()"
        [mobileOpen]="mobileOpen()"
        (closeMobile)="mobileOpen.set(false)"
        (toggleCollapse)="toggleSidebar()"
      />

      @if (mobileOpen()) {
        <div
          class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          (click)="mobileOpen.set(false)"
          aria-hidden="true"
        ></div>
      }

      <div class="flex h-dvh min-h-0 min-w-0 flex-1 flex-col">
        <app-topbar class="shrink-0" (toggleNavigation)="toggleNavigation()" />

        <main
          #mainContent
          id="main"
          class="ui-content-grid scroll-fade-y scroll-fade-16 min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-6 lg:px-8"
          tabindex="-1"
        >
          @if (loading()) {
            <div
              class="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              <ui-spinner size="sm" [label]="t().appLoading" />
              <span>{{ t().appLoading }}</span>
            </div>
          }
          <div class="w-full">
            <router-outlet />
          </div>
        </main>

        <app-footer class="shrink-0" />
      </div>
    </div>
  `,
})
export class AppShell {
  private readonly preferences = inject(PreferencesService);
  private readonly i18n = inject(TranslationService);
  protected readonly collapsed = this.preferences.sidebarCollapsed;
  protected readonly mobileOpen = signal(false);
  protected readonly loading = signal(false);
  protected readonly t = this.i18n.layout;

  private readonly router = inject(Router);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading.set(false);
      }
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.mobileOpen.set(false);
        const main = this.mainContent()?.nativeElement;
        if (main) {
          main.scrollTop = 0;
        }
      });
  }

  protected toggleNavigation(): void {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    if (isDesktop) {
      this.toggleSidebar();
      return;
    }

    this.mobileOpen.update((open) => !open);
  }

  protected toggleSidebar(): void {
    this.preferences.toggleSidebar();
  }
}
