import { NAV_SECTIONS } from '@/core/nav';

describe('NAV_SECTIONS', () => {
  it('exposes a single section containing only Home', () => {
    expect(NAV_SECTIONS).toHaveLength(1);
    expect(NAV_SECTIONS[0].items).toHaveLength(1);
  });

  it('points the Home item at /home', () => {
    const [item] = NAV_SECTIONS[0].items;

    expect(item.labelKey).toBe('navHome');
    expect(item.path).toBe('/home');
    expect(item.icon).toBe('home');
    expect(item.exact).toBe(true);
    expect(item.children).toBeUndefined();
  });
});
