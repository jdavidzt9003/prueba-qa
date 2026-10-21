import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../support/env';
import fs from 'node:fs';
import path from 'node:path';

const authFile = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

setup('login y guardar sesión reutilizable', async ({ page }) => {
  setup.skip(!env.username || !env.password, 'Configura E2E_USERNAME y E2E_PASSWORD en e2e/.env.');
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.username, env.password);
  await expect(page).not.toHaveURL(/\/login(?:\/|$)/);
  await page.context().storageState({ path: authFile });
});
