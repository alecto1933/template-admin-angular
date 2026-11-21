// profile-management contract v1 — keep byte-identical with the copy in the other repo
// (host: src/app/core/federation/federation.contract.ts, remote: src/app/core/federation.contract.ts).
export const PROFILE_CONTEXT = 'IVENDOR_PROFILE_CONTEXT';

export type Lang = 'id' | 'en' | 'ja';
export type ThemeMode = 'light' | 'dark';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface ProfileContext {
  lang: () => Lang;
  theme: () => ThemeMode;
  user: () => SessionUser | null;
  assetBase: string;
}
