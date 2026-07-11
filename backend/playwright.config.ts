/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // Fallback testDir, but we will pass the exact directory via CLI
  testDir: './src/temp_tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // Default reporter, overridden by CLI
  reporter: 'json',
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    headless: true, // Run without popping up browser windows
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
