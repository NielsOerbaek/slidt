import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
