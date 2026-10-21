
import { test, expect } from '@playwright/test';

test.describe('DEF-003 - Paginación del Libro de medidores', () => {
  test.fail(
    true,
    'DEF-003: el botón Siguiente no permite consultar la segunda página'
  );

  test('permite consultar los 12 medidores mediante paginación', async ({
    page,
  }) => {

    await page.goto('/medidores');

    await expect(
      page.getByRole('heading', { name: /medidores/i }).first()
    ).toBeVisible();

    const table = page.getByRole('table', { name: 'Medidores filtrados' });
    const rows = table.locator('tbody tr');

    await expect(rows).toHaveCount(10);

    const nextButton = page.getByRole('button', {
      name: /siguiente/i,
    });

    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();

    await nextButton.click();

    await expect(rows).toHaveCount(2);

  });
});
