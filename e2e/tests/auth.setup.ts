import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../support/env';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const authFile = path.join(
  __dirname,
  '..',
  'playwright',
  '.auth',
  'user.json',
);

setup('login y guardar sesión reutilizable', async ({ page }) => {
  if (!env.username || !env.password) {
    throw new Error(
      'Faltan E2E_USERNAME o E2E_PASSWORD en el archivo e2e/.env',
    );
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(env.username, env.password);

  await expect(page).not.toHaveURL(/\/login(?:\/|$)/);

  await page.context().storageState({ path: authFile });

  console.log(`Sesión guardada en: ${authFile}`);
});