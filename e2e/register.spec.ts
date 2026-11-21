import { expect, test } from '@playwright/test';
import { seedPreferences } from './support';

test.beforeEach(async ({ page }) => {
  await seedPreferences(page);
});

test.describe('Register', () => {
  test('renders the vendor registration form and switches language', async ({ page }) => {
    await page.goto('/auth/register');

    await expect(page.getByRole('heading', { name: 'Profil Vendor' })).toBeVisible();
    await expect(page.getByText('Perusahaan Indonesia', { exact: true })).toBeVisible();
    await expect(page.getByText('Perusahaan Non Indonesia', { exact: true })).toBeVisible();
    await expect(page.getByText('Pemerintahan', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Bahasa: Indonesia', exact: true }).click();
    await page.getByRole('menuitem', { name: 'English', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Vendor Profile' })).toBeVisible();
    await expect(page.getByText('Indonesian Company', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('ivendor-language'))).toBe('en');
  });

  test('cancel confirmation returns to the login page', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: 'Profil Vendor' })).toBeVisible();

    await page.getByRole('button', { name: 'Batalkan', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Batalkan registrasi?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Ya, batalkan', exact: true }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'SISTEM MANAJEMEN VENDOR' })).toBeVisible();
  });
});
