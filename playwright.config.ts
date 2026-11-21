import { defineConfig, devices } from '@playwright/test';

const PORT = 4205;
const baseURL = `http://localhost:${PORT}`;
const REMOTE_PORT = 4201;
const remoteDir = process.env['PROFILE_REMOTE_DIR'] ?? '../ivendor-superapps-profile-management';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Angular's dev server compiles lazy chunks on demand. With several parallel
  // workers the module queue can exceed Playwright's 5s default, so give the
  // assertions room without relaxing what they check.
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // Pakai Google Chrome yang terpasang agar `--headed`/`--ui` tidak
      // bergantung pada Chromium bundled. Ganti ke 'msedge' bila perlu.
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: [
    {
      command: `npm --prefix ${remoteDir} start -- --port ${REMOTE_PORT}`,
      url: `http://localhost:${REMOTE_PORT}/remoteEntry.json`,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: `npm start -- --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
