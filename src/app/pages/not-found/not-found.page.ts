import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
      <h1 class="mt-3 font-display text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Tautan yang Anda buka mungkin sudah dipindahkan, dihapus, atau tidak pernah ada. Periksa
        kembali alamatnya atau kembali ke dashboard.
      </p>

      <div class="mt-7 flex flex-wrap items-center justify-center gap-2">
        <button uiButton (click)="goHome()">
          <ui-icon name="home" class="size-4" />
          Kembali ke dashboard
        </button>
        <button uiButton variant="outline" (click)="goBack()">
          <ui-icon name="arrow-left" class="size-4" />
          Halaman sebelumnya
        </button>
      </div>

      <div
        class="mt-10 w-full max-w-md rounded-2xl border border-border bg-card p-4 text-left text-xs text-muted-foreground"
      >
        <p class="mb-2 font-semibold text-foreground">Halaman yang tersedia</p>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-muted px-2.5 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="go('/dashboard')"
          >
            /dashboard
          </button>
          <button
            type="button"
            class="rounded-lg bg-muted px-2.5 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="go('/orders')"
          >
            /orders
          </button>
          <button
            type="button"
            class="rounded-lg bg-muted px-2.5 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="go('/components')"
          >
            /components
          </button>
          <button
            type="button"
            class="rounded-lg bg-muted px-2.5 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            (click)="go('/settings')"
          >
            /settings
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundPage {
  private readonly router = inject(Router);

  protected goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  protected goBack(): void {
    history.back();
  }

  protected go(path: string): void {
    this.router.navigate([path]);
  }
}
