import { Route } from '@angular/router';
import { FederatedHostShell } from '@/core/federation/federated-host-shell';
import { provideProfileContext } from '@/core/federation/profile-context.provider';
import { loadProfileManagementRoutes } from '@/core/federation/remote-loader';

export function profileManagementRoute(): Route {
  return {
    path: 'profile-management',
    title: 'Vendor Profile · iVendor Superapps',
    data: { page: 'profileManagement' },
    // Providers stay on the parent so the lazily loaded child inherits the
    // shared profile context.
    providers: [provideProfileContext()],
    component: FederatedHostShell,
    children: [
      {
        path: '',
        loadChildren: () =>
          loadProfileManagementRoutes().catch(() => [
            {
              path: '**',
              loadComponent: () =>
                import('@/pages/remote-error/remote-error.page').then((m) => m.RemoteErrorPage),
            },
          ]),
      },
    ],
  };
}
