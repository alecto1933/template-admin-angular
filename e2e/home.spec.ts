import { expect, test } from '@playwright/test';
import { loginAsDemo, openUserMenu, seedPreferences } from './support';

const THEME_KEY = 'alecto-theme';

test.beforeEach(async ({ page }) => {
  await seedPreferences(page);
});

test.describe('Home', () => {
  test('renders five quick-access cards with background images', async ({ page }) => {
    await loginAsDemo(page);

    const cards = page.locator('#quick-access button.group');
    await expect(cards).toHaveCount(5);

    const data = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const imageSpan = element.querySelector('span[aria-hidden="true"]') as HTMLElement | null;
        return {
          label: element.getAttribute('aria-label') ?? '',
          background: imageSpan ? getComputedStyle(imageSpan).backgroundImage : '',
        };
      }),
    );

    expect(data).toHaveLength(5);
    for (const card of data) {
      expect(card.label.length).toBeGreaterThan(0);
      expect(card.background).toContain('url(');
      expect(card.background).toMatch(/\/images\/apps\/.+\.webp/);
    }
  });

  test('support card links to the support mailbox', async ({ page }) => {
    await loginAsDemo(page);

    const supportCard = page.locator('a[href^="mailto:"]');
    await expect(supportCard).toHaveCount(1);
    await expect(supportCard).toHaveAttribute('href', 'mailto:aionomic-support@aio.co.id');
    await expect(supportCard).toBeVisible();
  });

  test('notifications panel opens with three notifications', async ({ page }) => {
    await loginAsDemo(page);

    await page.getByRole('button', { name: 'Notifikasi', exact: true }).click();

    const panel = page.locator('.ui-menu-panel').filter({ hasText: 'Lihat semua notifikasi' });
    await expect(panel).toBeVisible();
    await expect(panel.getByText('3 baru')).toBeVisible();
    await expect(panel.getByText('Pembayaran diterima', { exact: true })).toBeVisible();
    await expect(panel.getByText('Stok hampir habis', { exact: true })).toBeVisible();
    await expect(panel.getByText('Anggota baru bergabung', { exact: true })).toBeVisible();
  });

  test('theme toggles between dark and light and persists the preference', async ({ page }) => {
    await loginAsDemo(page);
    const html = page.locator('html');

    await expect(html).not.toHaveClass(/dark/);

    await openUserMenu(page);
    await page.getByRole('menuitem', { name: 'Mode gelap', exact: true }).click();
    await expect(html).toHaveClass(/dark/);
    expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe('dark');

    await openUserMenu(page);
    await page.getByRole('menuitem', { name: 'Mode terang', exact: true }).click();
    await expect(html).not.toHaveClass(/dark/);
    expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe('light');
  });

  test('sidebar collapses, expands, and shows a tooltip on collapsed nav items', async ({ page }) => {
    await loginAsDemo(page);

    const sidebar = page.locator('aside.ui-sidebar');
    const toggle = page.getByRole('button', {
      name: 'Buka atau tutup navigasi',
      exact: true,
    });
    const homeLink = page.locator('aside .ui-sidebar-link').first();
    const homeTooltip = page.locator('.ui-sidebar ui-tooltip').filter({ hasText: 'Home' });

    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(homeTooltip).toHaveCount(1);

    await homeLink.hover();
    await expect(homeTooltip).toHaveCSS('opacity', '1');

    await toggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await expect(homeTooltip).toHaveCount(0);

    await toggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    await expect(homeTooltip).toHaveCount(1);
  });
});
