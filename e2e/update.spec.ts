import { expect, test } from '@playwright/test';

test('shows the update banner when a new build id is served', async ({ page }) => {
  let buildId = 'build-1';

  await page.route('**/version.json*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '2.0.0', buildId, builtAt: '2026-01-01T00:00:00.000Z' }),
    });
  });

  await page.goto('/ivendor/#/login');
  await expect(page.locator('#login-username')).toBeVisible();

  buildId = 'build-2';
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await expect(page.getByText('Versi baru tersedia')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Muat ulang', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Nanti saja', exact: true }).click();
  await expect(page.getByText('Versi baru tersedia')).toHaveCount(0);
});

test('reloads with a cache-busting build id when accepted', async ({ page }) => {
  let buildId = 'build-1';

  await page.route('**/version.json*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '2.0.0', buildId, builtAt: '2026-01-01T00:00:00.000Z' }),
    });
  });

  await page.goto('/ivendor/#/login');
  await expect(page.locator('#login-username')).toBeVisible();

  buildId = 'build-9';
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('Versi baru tersedia')).toBeVisible();

  await page.getByRole('button', { name: 'Muat ulang', exact: true }).click();

  await page.waitForURL(/v=build-9/);
  expect(page.url()).toContain('#/login');
});
