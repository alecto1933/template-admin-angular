const PREFIX = 'ivendor-';

export function appKey(name: string): string {
  return `${PREFIX}${name}`;
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); ignore.
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
}

export function readJson<T>(key: string): T | null {
  const raw = readString(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    if (raw === undefined) {
      return;
    }
    writeString(key, raw);
  } catch {
    // Circular structure, BigInt, or unavailable storage; ignore.
  }
}
