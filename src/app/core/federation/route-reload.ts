import { InjectionToken } from '@angular/core';

export interface RouteReloadTarget {
  href: string;
  replace(url: string): void;
}

/**
 * The location used to perform a full-document reload. Overridable in tests
 * because jsdom's `window.location` methods are non-configurable.
 */
export const ROUTE_RELOAD_TARGET = new InjectionToken<RouteReloadTarget>('ROUTE_RELOAD_TARGET', {
  providedIn: 'root',
  factory: () => window.location,
});

/**
 * Reloads the profile management route as a new document so federation
 * bootstrap runs again and retries the remote.
 *
 * The `retry` query param is required: replacing the current entry with the
 * exact same URL is a no-op in browsers, and the error page already sits on
 * `#/profile-management`.
 */
export function reloadProfileManagementRoute(location: RouteReloadTarget): void {
  const url = new URL(location.href);
  url.searchParams.set('retry', String(Date.now()));
  url.hash = '#/profile-management';
  location.replace(url.toString());
}
