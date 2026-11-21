import { initFederation } from '@angular-architects/native-federation';

/**
 * Reads the federation manifest defensively.
 *
 * A missing, unreadable, or malformed manifest must not block bootstrap: the
 * host shell still has to render so users can reach pages that do not depend on
 * a remote (and see the remote error card when they do). Native Federation
 * resolves relative values against the document base href, so the staging and
 * production entries stay relative.
 */
async function loadManifest(): Promise<Record<string, string>> {
  try {
    const response = await fetch('federation.manifest.json', { cache: 'no-store' });
    if (!response.ok) return {};
    const value = (await response.json()) as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

void (async () => {
  const manifest = await loadManifest();
  await initFederation(manifest, { hostRemoteEntry: { url: './remoteEntry.json' } });
  await import('./bootstrap');
})().catch((error) => console.error(error));
