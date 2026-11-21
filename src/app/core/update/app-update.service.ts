import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

export interface AppVersionInfo {
  version: string;
  buildId: string;
  builtAt?: string;
}

export type PendingVersion = AppVersionInfo & { id: string };

interface VersionSource {
  id: string;
  url: string;
}

const HOST_SOURCE_ID = 'host';
const VERSION_FILE = 'version.json';
const MANIFEST_FILE = 'federation.manifest.json';
const POLL_INTERVAL_MS = 120_000;
const MIN_CHECK_GAP_MS = 15_000;

/**
 * Detects deployments by comparing the `buildId` served next to the host and
 * every federated remote with the baselines captured on the first check.
 *
 * The first successful read of a source establishes its baseline; later checks
 * expose the changed sources through `pending`. A source that fails or has no
 * readable `version.json` is treated as unknown and never blocks the others.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly sources = signal<VersionSource[]>([{ id: HOST_SOURCE_ID, url: VERSION_FILE }]);
  private readonly baselines = new Map<string, string>();
  private readonly dismissed = new Set<string>();

  private lastCheckAt = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly _pending = signal<PendingVersion[]>([]);

  /** Resolved after the manifest is read and the first check finishes. */
  readonly ready: Promise<void>;

  readonly pending = this._pending.asReadonly();
  readonly updateAvailable = computed(() => this._pending().length > 0);

  constructor() {
    this.ready = this.bootstrap();
    this.timer = setInterval(() => void this.checkNow(), POLL_INTERVAL_MS);

    const onFocus = (): void => void this.checkNow(true);
    const onVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        void this.checkNow(true);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    this.destroyRef.onDestroy(() => {
      if (this.timer) {
        clearInterval(this.timer);
      }
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    });
  }

  /** Returns true when at least one source reports a new deployment. */
  async checkNow(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this.lastCheckAt < MIN_CHECK_GAP_MS) {
      return false;
    }
    this.lastCheckAt = now;

    const sources = this.sources();
    const results = await Promise.allSettled(sources.map((source) => this.fetchVersion(source)));

    const infos = new Map<string, AppVersionInfo>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        infos.set(sources[index].id, result.value);
      }
    });

    const pending: PendingVersion[] = [];
    for (const source of sources) {
      const info = infos.get(source.id);
      if (!info) {
        continue;
      }

      const baseline = this.baselines.get(source.id);
      if (!baseline) {
        this.baselines.set(source.id, info.buildId);
        continue;
      }

      const dismissedKey = `${source.id}:${info.buildId}`;
      if (info.buildId !== baseline && !this.dismissed.has(dismissedKey)) {
        pending.push({ ...info, id: source.id });
      }
    }

    this._pending.set(pending);
    return pending.length > 0;
  }

  dismiss(): void {
    for (const entry of this._pending()) {
      this.dismissed.add(`${entry.id}:${entry.buildId}`);
    }
    this._pending.set([]);
  }

  reload(): void {
    const key = this._pending()
      .map((entry) => entry.buildId)
      .join(',');
    if (!key) {
      location.reload();
      return;
    }
    location.replace(this.buildReloadUrl(key));
  }

  /** Builds a cache-busting reload URL that keeps the current hash route. */
  buildReloadUrl(buildId: string): string {
    const url = new URL(location.href);
    url.searchParams.set('v', buildId);
    return url.toString();
  }

  private async bootstrap(): Promise<void> {
    await this.discoverSources();
    await this.checkNow(true);
  }

  /**
   * Reads the federation manifest once and appends a `version.json` source for
   * every remote next to its `remoteEntry.json`.
   */
  private async discoverSources(): Promise<void> {
    try {
      const response = await fetch(this.fileUrl(MANIFEST_FILE), { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const manifest = (await response.json()) as Record<string, string> | null;
      if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        return;
      }

      const remotes = Object.entries(manifest)
        .filter(([, entry]) => typeof entry === 'string' && entry.length > 0)
        .map(([id, entry]) => ({
          id,
          url: new URL(VERSION_FILE, new URL(entry, document.baseURI)).href,
        }));

      this.sources.set([{ id: HOST_SOURCE_ID, url: VERSION_FILE }, ...remotes]);
    } catch {
      // Host-only mode when the manifest is unavailable.
    }
  }

  /** Resolves against <base href> so sub-folder deployments keep working. */
  private fileUrl(file: string, now = Date.now()): string {
    const url = new URL(file, document.baseURI);
    url.searchParams.set('t', String(now));
    return url.toString();
  }

  private async fetchVersion(source: VersionSource): Promise<AppVersionInfo | null> {
    try {
      const response = await fetch(this.fileUrl(source.url), { cache: 'no-store' });
      if (!response.ok) {
        return null;
      }
      const info = (await response.json()) as AppVersionInfo;
      return typeof info?.buildId === 'string' && info.buildId.length > 0 ? info : null;
    } catch {
      return null;
    }
  }
}
