import { expect, test } from '@playwright/test';
import { gotoLogin, loginAsDemo, openUserMenu, seedPreferences } from './support';

const SESSION_KEY = 'ivendor-session';

test.beforeEach(async ({ page }) => {
  await seedPreferences(page);
});

test.describe('Authentication', () => {
  test('shows validation for an empty form', async ({ page }) => {
    await gotoLogin(page);

    await page.locator('#login-username').fill('');
    await page.locator('#login-password').fill('');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    await expect(page.getByText('Username wajib diisi.')).toBeVisible();
    await expect(page.getByText('Kata sandi minimal 6 karakter.')).toBeVisible();
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('shows validation for a password shorter than 6 characters', async ({ page }) => {
    await gotoLogin(page);

    await page.locator('#login-username').fill('demo.vendor');
    await page.locator('#login-password').fill('12345');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    await expect(page.getByText('Kata sandi minimal 6 karakter.')).toBeVisible();
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('valid credentials sign in and persist the session', async ({ page }) => {
    await loginAsDemo(page);

    await expect(page).toHaveURL(/#\/home$/);
    const session = await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY);
    expect(session).not.toBeNull();
    expect(JSON.parse(session as string)).toMatchObject({ email: 'raka@alecto.id' });
  });

  test('cancelling the logout dialog keeps the user on home', async ({ page }) => {
    await loginAsDemo(page);

    await openUserMenu(page);
    await page.getByRole('menuitem', { name: 'Keluar', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Keluar dari aplikasi?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Batal', exact: true }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/#\/home$/);
    expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).not.toBeNull();
  });

  test('confirming logout returns to login and clears the stored session', async ({ page }) => {
    await loginAsDemo(page);

    await openUserMenu(page);
    await page.getByRole('menuitem', { name: 'Keluar', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByText('Keluar dari aplikasi?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Ya, keluar', exact: true }).click();

    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.locator('#login-username')).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), SESSION_KEY)).toBeNull();
  });
});
