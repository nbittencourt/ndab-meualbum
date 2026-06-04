import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test-explore/specs',
  timeout: 15_000,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-explore/report', open: 'never' }],
  ],
  globalSetup: './test-explore/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'on',
    video: 'off',
    trace: 'off',
    storageState: 'test-explore/.setup-state.json',
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'mobile',  use: { viewport: { width: 375,  height: 812 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
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
        CADASTRO_COOLDOWN_SECS: '5',
        RATE_LIMIT_MAX: '5',
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
