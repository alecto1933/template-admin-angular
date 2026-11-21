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
  // Angular's dev server compiles lazy chunks on demand; three workers keep the
  // module queue short without contending like the default global limit.
  workers: process.env['CI'] ? 1 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
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
      command: `npm --prefix "${remoteDir}" start -- --port ${REMOTE_PORT}`,
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
