import { reloadProfileManagementRoute } from '@/core/federation/route-reload';

describe('reloadProfileManagementRoute', () => {
  it('replaces the entry with the profile route and a cache-busting param', () => {
    const replace = vi.fn();

    reloadProfileManagementRoute({
      href: 'http://localhost:1933/ivendor/?retry=1#/profile-management',
      replace,
    });

    expect(replace).toHaveBeenCalledTimes(1);
    const target = new URL(replace.mock.calls[0][0]);
    expect(target.origin).toBe('http://localhost:1933');
    expect(target.pathname).toBe('/ivendor/');
    expect(target.hash).toBe('#/profile-management');
    expect(target.searchParams.get('retry')).toMatch(/^\d+$/);
    expect(target.searchParams.get('retry')).not.toBe('1');
  });

  it('does not carry stale hash query state into the reload', () => {
    const replace = vi.fn();

    reloadProfileManagementRoute({
      href: 'http://localhost:1933/ivendor/#/profile-management?retry=old',
      replace,
    });

    const target = new URL(replace.mock.calls[0][0]);
    expect(target.hash).toBe('#/profile-management');
  });
});
