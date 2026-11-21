import { appKey, readJson, readString, remove, writeJson, writeString } from '@/core/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

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

  it('returns null when reading is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(readString(appKey('language'))).toBeNull();
    expect(readJson(appKey('session'))).toBeNull();
  });

  it('swallows write errors when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => writeString(appKey('language'), 'ja')).not.toThrow();
    expect(() => writeJson(appKey('session'), { id: 'usr-1' })).not.toThrow();
    expect(() => remove(appKey('language'))).not.toThrow();
  });

  it('skips values that JSON cannot represent', () => {
    writeJson(appKey('undefined'), undefined);
    expect(readString(appKey('undefined'))).toBeNull();

    writeJson(appKey('fn'), () => 'noop');
    expect(readString(appKey('fn'))).toBeNull();
  });

  it('does not throw on circular values', () => {
    const circular: Record<string, unknown> = { id: 'usr-1' };
    circular['self'] = circular;

    expect(() => writeJson(appKey('circular'), circular)).not.toThrow();
    expect(readString(appKey('circular'))).toBeNull();
  });

  it('keeps an existing value when a write fails', () => {
    writeJson(appKey('session'), { id: 'usr-1' });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    writeJson(appKey('session'), { id: 'usr-2' });

    expect(readJson<{ id: string }>(appKey('session'))).toEqual({ id: 'usr-1' });
  });
});
