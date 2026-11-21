import { expect, test } from '@playwright/test';
import { seedPreferences } from './support';

test.beforeEach(async ({ page }) => {
  await seedPreferences(page, { language: 'en' });
});

test('unknown routes render the translated 404 page and return home', async ({ page }) => {
  await page.goto('/#/this/route/does/not/exist');

  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(
    page.getByText(/The link you opened may have been moved, deleted, or never existed/),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Back to home', exact: true }).click();

  await expect(page).toHaveURL(/#\/home$/);
  await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
});
