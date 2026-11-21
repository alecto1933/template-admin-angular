import { expect, test } from '@playwright/test';
import { seedPreferences } from './support';

test.describe('federation manifest fallback', () => {
  test.beforeEach(async ({ page }) => {
    await seedPreferences(page);
  });

  test('still renders the host shell and the remote error card when the manifest is unreachable', async ({
    page,
  }) => {
    await page.route('**/federation.manifest.json', (route) => route.abort());

    await page.goto('/ivendor/#/home');
    await expect(page.getByRole('heading', { name: 'Applications & Workspaces' })).toBeVisible();

    await page.goto('/ivendor/#/profile-management');
    await expect(
      page.getByRole('heading', { name: 'Modul profil tidak bisa dimuat' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  });
});
