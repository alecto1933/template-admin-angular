import { NAV_SECTIONS } from '@/core/nav';

describe('NAV_SECTIONS', () => {
  it('exposes a single section containing Home and profile management', () => {
    expect(NAV_SECTIONS).toHaveLength(1);
    expect(NAV_SECTIONS[0].items).toHaveLength(2);
  });

  it('points the Home item at /home', () => {
    const [item] = NAV_SECTIONS[0].items;

    expect(item.labelKey).toBe('navHome');
    expect(item.path).toBe('/home');
    expect(item.icon).toBe('home');
    expect(item.exact).toBe(true);
    expect(item.children).toBeUndefined();
  });

  it('includes profile management with all section children', () => {
    const item = NAV_SECTIONS[0].items.find((entry) => entry.path === '/profile-management');
    expect(item).toBeDefined();
    expect(item!.labelKey).toBe('navProfileManagement');
    expect(item!.icon).toBe('user');
    expect(item!.children?.map((child) => child.path)).toEqual([
      '/profile-management',
      '/profile-management/vendor',
      '/profile-management/pic',
      '/profile-management/bank',
      '/profile-management/tax',
      '/profile-management/domicile',
    ]);
    expect(item!.children?.map((child) => child.labelKey)).toEqual([
      'navProfileOverview',
      'navProfileVendor',
      'navProfilePic',
      'navProfileBank',
      'navProfileTax',
      'navProfileDomicile',
    ]);
  });

  it('marks the overview child as an exact match', () => {
    const item = NAV_SECTIONS[0].items.find((entry) => entry.path === '/profile-management');
    const [overview, ...rest] = item!.children ?? [];

    expect(overview.exact).toBe(true);
    for (const child of rest) {
      expect(child.exact).toBeUndefined();
    }
  });
});
