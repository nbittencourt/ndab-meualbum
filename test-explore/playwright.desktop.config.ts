import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 180_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    deviceScaleFactor: 1,
  },
  projects: [{ name: 'desktop-chromium' }],
});
