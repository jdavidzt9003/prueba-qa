import { test, expect } from '@playwright/test';
import { MetersPage } from '../pages/meters.page';
import { meterDetailsData } from '../config/test-data';

test('flujo de negocio: buscar M-109 y validar su detalle', async ({ page }) => {
  const metersPage = new MetersPage(page);
  await metersPage.goto();
  await metersPage.searchMeter(meterDetailsData.meterId);
  await metersPage.openMeter(meterDetailsData.meterId);

  await expect(page.locator('#meter-title')).toContainText(meterDetailsData.meterId);
});
