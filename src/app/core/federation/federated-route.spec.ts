import { FactoryProvider, Type } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { PROFILE_CONTEXT } from '@/core/federation/federation.contract';
import { profileManagementRoute } from '@/core/federation/federated-route';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { SessionService } from '@/core/state/session.service';
import { RemoteErrorPage } from '@/pages/remote-error/remote-error.page';

vi.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: vi.fn(),
}));

const loadChildren = (route: Route): (() => Promise<Routes>) =>
  route.loadChildren as () => Promise<Routes>;

describe('profileManagementRoute', () => {
  beforeEach(() => {
    vi.mocked(loadRemoteModule).mockReset();
  });

  it('declares the remote route with contract providers and a lazy loader', () => {
    const route = profileManagementRoute();

    expect(route.path).toBe('profile-management');
    expect(route.title).toBe('Vendor Profile · iVendor Superapps');
    expect(route.data).toEqual({ page: 'profileManagement' });
    expect(route.providers).toHaveLength(1);
    expect(typeof route.loadChildren).toBe('function');

    const provider = route.providers?.[0] as FactoryProvider;
    expect(provider.provide).toBe(PROFILE_CONTEXT);
    expect(provider.deps).toEqual([TranslationService, PreferencesService, SessionService]);
    expect(typeof provider.useFactory).toBe('function');
  });

  it('loads the remote Routes from the exposed module', async () => {
    const remoteRoutes: Routes = [{ path: '', children: [] }];
    vi.mocked(loadRemoteModule).mockResolvedValue({
      PROFILE_MANAGEMENT_ROUTES: remoteRoutes,
    });

    const routes = await loadChildren(profileManagementRoute())();

    expect(loadRemoteModule).toHaveBeenCalledWith({
      remoteName: 'profile-management',
      exposedModule: './Routes',
    });
    expect(routes).toBe(remoteRoutes);
  });

  it('falls back to the error page when the remote cannot be loaded', async () => {
    vi.mocked(loadRemoteModule).mockRejectedValue(new Error('remote offline'));

    const routes = await loadChildren(profileManagementRoute())();
    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe('**');

    const loadComponent = routes[0].loadComponent as () => Promise<Type<unknown>>;
    await expect(loadComponent()).resolves.toBe(RemoteErrorPage);
  });
});
