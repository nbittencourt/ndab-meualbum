import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10_000,
  expect: { timeout: 3_000 },
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 375, height: 812 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: [
    {
      command: 'npm run dev:server',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        NODE_ENV: 'test',
        MONGODB_URI: process.env.MONGODB_URI!,
        JWT_SECRET: process.env.JWT_SECRET ?? 'jwt-secret-para-testes-apenas',
      },
    },
    {
      command: 'npm run dev:client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
