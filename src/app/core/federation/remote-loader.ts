import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

interface ProfileManagementRemoteModule {
  PROFILE_MANAGEMENT_ROUTES: Routes;
}

export async function loadProfileManagementRoutes(): Promise<Routes> {
  const module = await loadRemoteModule<ProfileManagementRemoteModule>({
    remoteName: 'profile-management',
    exposedModule: './Routes',
  });
  return module.PROFILE_MANAGEMENT_ROUTES;
}
