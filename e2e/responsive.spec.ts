import { expect, test } from '@playwright/test';
import { loginAsDemo, seedPreferences } from './support';

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await seedPreferences(page);
});

test.describe('Mobile layout', () => {
  test('hides the hero, stacks cards in one column, and keeps the footer on one row', async ({
    page,
  }) => {
    await loginAsDemo(page);

    // Hero section is hidden below the `sm` breakpoint.
    await expect(page.locator('img[src="/images/background.webp"]')).toBeHidden();

    // Cards use a single grid column.
    const grid = page.locator('#quick-access div.grid').first();
    const columns = await grid.evaluate((element) => {
      return getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean);
    });
    expect(columns).toHaveLength(1);

    const cards = page.locator('#quick-access button.group');
    await expect(cards).toHaveCount(5);
    const xs = await cards.evaluateAll((elements) =>
      elements.map((element) => Math.round(element.getBoundingClientRect().x)),
    );
    expect(new Set(xs).size).toBe(1);

    // Footer is a single horizontal row.
    const footerRow = page.locator('app-footer footer > div');
    await expect(footerRow).toHaveCSS('flex-direction', 'row');

    const copyright = page.locator('app-footer').getByText(/©/);
    const version = page.getByText(/v2\.0\.0/);
    const copyrightBox = await copyright.boundingBox();
    const versionBox = await version.boundingBox();
    expect(copyrightBox).not.toBeNull();
    expect(versionBox).not.toBeNull();
    expect(Math.abs((copyrightBox?.y ?? 0) - (versionBox?.y ?? 0))).toBeLessThan(8);
  });

  test('hamburger opens the sidebar drawer and the overlay closes it', async ({ page }) => {
    await loginAsDemo(page);

    const sidebar = page.locator('aside.ui-sidebar');
    const overlay = page.locator('div.fixed.inset-0.bg-black\\/40');
    const hamburger = page.getByRole('button', {
      name: 'Buka atau tutup navigasi',
      exact: true,
    });

    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect
      .poll(async () => Math.round((await sidebar.boundingBox())?.x ?? 0))
      .toBeLessThan(0);

    await hamburger.click();

    await expect(sidebar).toHaveAttribute('data-mobile-open', 'true');
    await expect(overlay).toBeVisible();
    await expect
      .poll(async () => Math.round((await sidebar.boundingBox())?.x ?? -1))
      .toBeGreaterThanOrEqual(0);

    // Click the backdrop to the right of the 276px drawer.
    await overlay.click({ position: { x: 350, y: 400 } });

    await expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    await expect(overlay).toBeHidden();
    await expect
      .poll(async () => Math.round((await sidebar.boundingBox())?.x ?? 0))
      .toBeLessThan(0);
  });
});
