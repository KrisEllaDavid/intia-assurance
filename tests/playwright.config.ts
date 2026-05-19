import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './e2e',
  timeout:  45_000,
  retries:  process.env.CI ? 2 : 1,
  workers:  1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL:    process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    headless:   true,
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
