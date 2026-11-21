import { expect, test } from '@playwright/test';
import { seedPreferences } from './support';

test.describe('profile management remote', () => {
  test.beforeEach(async ({ page }) => {
    await seedPreferences(page);
  });

  test('opens from the home card and saves a bank change', async ({ page }) => {
    await page.goto('/ivendor/#/home');
    await page.getByRole('button', { name: /Vendor Profile Management/ }).click();

    await expect(page).toHaveURL(/#\/profile-management$/);
    await expect(page.getByRole('heading', { name: 'Profil Vendor' })).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: 'Rekening Bank' }).click();
    await expect(page).toHaveURL(/#\/profile-management\/bank$/);

    await page.getByRole('button', { name: 'Ubah' }).click();
    await page.getByLabel('Atas nama').fill('PT Contoh Baru');
    await page.getByRole('button', { name: 'Simpan' }).click();

    await expect(page.getByText('PT Contoh Baru')).toBeVisible();
  });

  test('shows the content loading indicator while the remote resolves', async ({
    page,
    request,
  }) => {
    const manifestResponse = await request.get('/ivendor/federation.manifest.json');
    const manifest = (await manifestResponse.json()) as Record<string, string>;
    const remoteOrigin = new URL(manifest['profile-management'], manifestResponse.url()).origin;

    // Slow the remote module fetch down so the transient router-driven indicator
    // is deterministically observable instead of racing the dev server.
    await page.route(`${remoteOrigin}/**`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/ivendor/#/home');
    await page.getByRole('button', { name: /Vendor Profile Management/ }).click();

    await expect(page.locator('main [role="status"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Profil Vendor' })).toBeVisible();
    await expect(page.locator('main [role="status"]')).toHaveCount(0);
  });

  test('shows a retry card when the remote cannot be loaded', async ({ page, request }) => {
    // Federation reads remoteEntry.json eagerly at bootstrap, so blocking the
    // entry itself would leave a blank host. Simulate the remote module assets
    // being unreachable instead: init still succeeds, but the lazy import of
    // `./Routes` fails and the host renders its error card.
    const manifestResponse = await request.get('/ivendor/federation.manifest.json');
    const manifest = (await manifestResponse.json()) as Record<string, string>;
    // Resolve against the manifest URL so the base follows the active host origin.
    const remoteEntry = new URL(manifest['profile-management'], manifestResponse.url());

    await page.route(`${remoteEntry.origin}/**`, (route) =>
      new URL(route.request().url()).pathname.endsWith('/remoteEntry.json')
        ? route.fallback()
        : route.abort(),
    );
    await page.goto('/ivendor/#/profile-management');

    await expect(
      page.getByRole('heading', { name: 'Modul profil tidak bisa dimuat' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  });
});
