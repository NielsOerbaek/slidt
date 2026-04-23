import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  snapshotPathTemplate: 'tests/visual/snapshots/{arg}{ext}',
  use: {
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
