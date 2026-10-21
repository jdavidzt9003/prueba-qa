
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga e2e/.env independientemente del directorio desde el que se ejecute Playwright.
dotenv.config({ path: path.join(__dirname, '.env') });

const authFile = path.join(
  __dirname,
  'playwright',
  '.auth',
  'user.json',
);

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: false,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});
