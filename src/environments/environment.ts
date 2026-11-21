import { AppEnvironment } from './environment.model';

/**
 * Default environment. Digunakan oleh unit test dan sebagai fallback.
 * Build development/staging/production mengganti file ini lewat
 * `fileReplacements` di angular.json.
 */
export const environment: AppEnvironment = {
  name: 'development',
  production: false,
  apiUrl: 'http://localhost:3000/api',
  supportEmail: 'aionomic-support@aio.co.id',
  appVersion: '2.0.0-dev',
  remoteAssetBase: 'http://localhost:4201/',
};
