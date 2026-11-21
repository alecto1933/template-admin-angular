import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

export interface AppVersionInfo {
  version: string;
  buildId: string;
  builtAt?: string;
}

const VERSION_FILE = 'version.json';
const POLL_INTERVAL_MS = 120_000;
const MIN_CHECK_GAP_MS = 15_000;

/**
 * Detects deployments by comparing the `buildId` of the running app with the
 * one served by `public/version.json`.
 *
 * The first successful check establishes the baseline; later checks expose
 * `updateAvailable` when the server reports a different build.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly destroyRef = inject(DestroyRef);

  private runningBuildId: string | null = null;
  private dismissedBuildId: string | null = null;
  private lastCheckAt = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly available = signal<AppVersionInfo | null>(null);

  readonly latestVersion = this.available.asReadonly();
  readonly updateAvailable = computed(() => this.available() !== null);

  constructor() {
    void this.checkNow();
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

  /** Returns true when a new deployment was detected. */
  async checkNow(force = false): Promise<boolean> {
    const now = Date.now();
    if (!force && now - this.lastCheckAt < MIN_CHECK_GAP_MS) {
      return false;
    }
    this.lastCheckAt = now;

    const info = await this.fetchVersion(now);
    if (!info) {
      return false;
    }

    if (this.runningBuildId === null) {
      this.runningBuildId = info.buildId;
      return false;
    }

    if (info.buildId === this.runningBuildId || info.buildId === this.dismissedBuildId) {
      return false;
    }

    this.available.set(info);
    return true;
  }

  dismiss(): void {
    this.dismissedBuildId = this.available()?.buildId ?? null;
    this.available.set(null);
  }

  reload(): void {
    const buildId = this.available()?.buildId;
    if (!buildId) {
      location.reload();
      return;
    }
    location.replace(this.buildReloadUrl(buildId));
  }

  /** Builds a cache-busting reload URL that keeps the current hash route. */
  buildReloadUrl(buildId: string): string {
    const url = new URL(location.href);
    url.searchParams.set('v', buildId);
    return url.toString();
  }

  /** Resolves against <base href> so sub-folder deployments keep working. */
  private versionUrl(now: number): string {
    return new URL(`${VERSION_FILE}?t=${now}`, document.baseURI).toString();
  }

  private async fetchVersion(now: number): Promise<AppVersionInfo | null> {
    try {
      const response = await fetch(this.versionUrl(now), { cache: 'no-store' });
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
