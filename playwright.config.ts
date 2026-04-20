import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    // Electron-specific settings handled per-test via electronApplication
  },
})
