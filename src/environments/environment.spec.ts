import { environment as production } from './environment.production';
import { environment as staging } from './environment.staging';
import { environment as development } from './environment.development';
import { environment as fallback } from './environment';

describe('environments', () => {
  it('uses the local profile-management remote for development builds', () => {
    expect(development.name).toBe('development');
    expect(development.production).toBe(false);
    expect(development.remoteAssetBase).toBe('http://localhost:4201/');
  });

  it('uses the local profile-management remote for the default environment', () => {
    expect(fallback.name).toBe('development');
    expect(fallback.remoteAssetBase).toBe('http://localhost:4201/');
  });

  it('serves profile-management assets from the staging sub-path', () => {
    expect(staging.name).toBe('staging');
    expect(staging.production).toBe(false);
    expect(staging.remoteAssetBase).toBe('/ivendor-staging/remotes/profile-management/');
  });

  it('serves profile-management assets from the production remotes path', () => {
    expect(production.name).toBe('production');
    expect(production.production).toBe(true);
    expect(production.remoteAssetBase).toBe('/remotes/profile-management/');
  });
});
