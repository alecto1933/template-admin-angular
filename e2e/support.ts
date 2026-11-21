import { expect, type Page } from '@playwright/test';

export interface SeedOptions {
  language?: 'id' | 'en' | 'ja';
  theme?: 'light' | 'dark';
}

/**
 * Seeds localStorage before Angular boots. A sessionStorage flag makes sure the
 * seed runs only once per browser context, so reload/persistence tests are not
 * wiped on every navigation.
 */
export async function seedPreferences(page: Page, options: SeedOptions = {}): Promise<void> {
  const { language = 'id', theme = 'light' } = options;

  await page.addInitScript(
    ({ language, theme }) => {
      if (sessionStorage.getItem('__e2e_seeded__')) {
        return;
      }
      sessionStorage.setItem('__e2e_seeded__', '1');
      localStorage.clear();
      localStorage.setItem('alecto-theme', theme);
      if (language !== 'id') {
        localStorage.setItem('ivendor-language', language);
      }
      localStorage.removeItem('ivendor-sidebar-collapsed');
    },
    { language, theme },
  );
}

export async function gotoLogin(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await expect(page.locator('#login-username')).toBeVisible();
}

export async function loginAsDemo(page: Page, submitLabel = 'Masuk'): Promise<void> {
  await gotoLogin(page);
  await page.locator('#login-username').fill('demo.vendor');
  await page.locator('#login-password').fill('secret123');
  await page.getByRole('button', { name: submitLabel, exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { name: 'Applications & Workspaces' })).toBeVisible();
}

export async function openUserMenu(page: Page, label = 'Menu pengguna'): Promise<void> {
  await page.getByRole('button', { name: label, exact: true }).click();
  await expect(page.locator('.ui-menu-panel').filter({ hasText: 'Keluar' })).toBeVisible();
}
