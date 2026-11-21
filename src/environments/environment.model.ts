export type EnvironmentName = 'development' | 'staging' | 'production';

export interface AppEnvironment {
  /** Nama environment aktif. */
  name: EnvironmentName;
  /** True hanya untuk build production. */
  production: boolean;
  /** Base URL API backend (placeholder sampai API tersedia). */
  apiUrl: string;
  /** Alamat email dukungan yang dipakai di UI. */
  supportEmail: string;
  /** Versi aplikasi yang ditampilkan/dipakai build. */
  appVersion: string;
  /** Base URL absolut/relatif untuk aset remote profile-management. */
  remoteAssetBase: string;
}
