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

  test('shows a retry card when the remote cannot be loaded', async ({ page, request }) => {
    // Federation reads remoteEntry.json eagerly at bootstrap, so blocking the
    // entry itself would leave a blank host. Simulate the remote module assets
    // being unreachable instead: init still succeeds, but the lazy import of
    // `./Routes` fails and the host renders its error card.
    const manifestResponse = await request.get('/ivendor/federation.manifest.json');
    const manifest = (await manifestResponse.json()) as Record<string, string>;
    const remoteEntry = new URL(manifest['profile-management'], 'http://localhost:4205');

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
