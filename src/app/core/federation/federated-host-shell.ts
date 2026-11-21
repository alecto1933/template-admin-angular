import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { UiSpinner } from '@/shared/ui/spinner/spinner';

/**
 * Host frame for federated routes.
 *
 * The remote owns its own page frame, so the host only contributes a lightweight
 * loading indicator while Angular resolves the lazy child routes. The spinner
 * disappears on the first `NavigationEnd` after the shell is mounted.
 */
@Component({
  selector: 'app-federated-host-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, UiSpinner],
  template: `
    @if (loading()) {
      <div class="grid place-items-center py-10" data-testid="federated-shell-loading">
        <ui-spinner size="lg" />
      </div>
    }
    <router-outlet />
  `,
})
export class FederatedHostShell {
  protected readonly loading = signal(true);

  private readonly router = inject(Router);

  constructor() {
    const subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.loading.set(false));

    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }
}
