import { appKey, readJson, readString, remove, writeJson, writeString } from '@/core/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('prefixes keys with the app namespace', () => {
    expect(appKey('language')).toBe('ivendor-language');
  });

  it('reads and writes strings', () => {
    writeString(appKey('language'), 'en');
    expect(readString(appKey('language'))).toBe('en');
  });

  it('returns null for missing keys', () => {
    expect(readString(appKey('missing'))).toBeNull();
    expect(readJson(appKey('missing'))).toBeNull();
  });

  it('round-trips JSON values', () => {
    writeJson(appKey('session'), { id: 'usr-1' });
    expect(readJson<{ id: string }>(appKey('session'))).toEqual({ id: 'usr-1' });
  });

  it('returns null for invalid JSON', () => {
    writeString(appKey('broken'), '{not-json');
    expect(readJson(appKey('broken'))).toBeNull();
  });

  it('removes a key', () => {
    writeString(appKey('language'), 'en');
    remove(appKey('language'));
    expect(readString(appKey('language'))).toBeNull();
  });
});
