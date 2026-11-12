import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppFooter } from './footer';
import { AppSidebar } from './sidebar';
import { AppTopbar } from './topbar';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppSidebar, AppTopbar, AppFooter],
  template: `
    <div class="flex h-dvh overflow-hidden bg-background">
      <app-sidebar
        [collapsed]="collapsed()"
        [mobileOpen]="mobileOpen()"
        (closeMobile)="mobileOpen.set(false)"
        (toggleCollapse)="collapsed.set(!collapsed())"
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
          class="ui-content-grid min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-6 lg:px-8"
          tabindex="-1"
        >
          <div class="mx-auto w-full max-w-[1400px]">
            <router-outlet />
          </div>
        </main>

        <app-footer class="shrink-0" />
      </div>
    </div>
  `,
})
export class AppShell {
  protected readonly collapsed = signal(false);
  protected readonly mobileOpen = signal(false);

  private readonly router = inject(Router);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor() {
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
      this.collapsed.update((collapsed) => !collapsed);
      return;
    }

    this.mobileOpen.update((open) => !open);
  }
}
