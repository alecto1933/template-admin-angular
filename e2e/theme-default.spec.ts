import { expect, test } from '@playwright/test';

test.describe('default theme', () => {
  test.use({ colorScheme: 'dark' });

  test('starts light even when the OS prefers dark', async ({ page }) => {
    await page.goto('/ivendor/#/login');
    await expect(page.locator('#login-username')).toBeVisible();

    await expect(page.locator('html')).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('alecto-theme'))).toBe('light');
  });
});
