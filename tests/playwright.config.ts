import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './e2e',
  timeout:  30_000,
  retries:  1,
  use: {
    baseURL:   'http://localhost:3000',
    headless:  true,
    screenshot:'only-on-failure',
    video:     'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
