import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  tsconfig: './tests/tsconfig.json',
  timeout: 30_000,
  retries: 0,
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
