import { expect, test } from '@playwright/test';
import { gotoLogin, seedPreferences } from './support';

const LANGUAGE_KEY = 'ivendor-language';

test.beforeEach(async ({ page }) => {
  await seedPreferences(page);
});

test('language selection translates the app and persists across reloads', async ({ page }) => {
  await gotoLogin(page);
  await expect(page.getByRole('heading', { name: 'SISTEM MANAJEMEN VENDOR' })).toBeVisible();

  // Indonesian -> English
  await page.getByRole('button', { name: 'Bahasa: Indonesia', exact: true }).click();
  await page.getByRole('menuitem', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'VENDOR MANAGEMENT SYSTEM' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)).toBe('en');

  // English -> Japanese
  await page.getByRole('button', { name: 'Language: English', exact: true }).click();
  await page.getByRole('menuitem', { name: '日本語', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ベンダー管理システム' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)).toBe('ja');

  // Sign in while Japanese is active.
  await page.locator('#login-username').fill('demo.vendor');
  await page.locator('#login-password').fill('secret123');
  await page.getByRole('button', { name: 'サインイン', exact: true }).click();
  await expect(page).toHaveURL(/#\/home$/);

  // Home content and layout chrome are translated.
  await expect(page.getByRole('heading', { name: '最近のアクティビティ' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ユーザーメニュー', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '通知', exact: true })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'メインナビゲーション' })).toBeVisible();

  // Reload keeps Japanese.
  await page.reload();
  await expect(page.getByRole('heading', { name: '最近のアクティビティ' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)).toBe('ja');

  // Switch back to English from the topbar.
  await page.getByRole('button', { name: 'Language: 日本語', exact: true }).click();
  await page.getByRole('menuitem', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), LANGUAGE_KEY)).toBe('en');
});
