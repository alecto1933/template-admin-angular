import { Route } from '@angular/router';
import { provideProfileContext } from '@/core/federation/profile-context.provider';
import { loadProfileManagementRoutes } from '@/core/federation/remote-loader';

export function profileManagementRoute(): Route {
  return {
    path: 'profile-management',
    title: 'Vendor Profile · iVendor Superapps',
    data: { page: 'profileManagement' },
    providers: [provideProfileContext()],
    loadChildren: () =>
      loadProfileManagementRoutes().catch(() => [
        {
          path: '**',
          loadComponent: () =>
            import('@/pages/remote-error/remote-error.page').then((m) => m.RemoteErrorPage),
        },
      ]),
  };
}
