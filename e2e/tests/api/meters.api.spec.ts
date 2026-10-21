import { test, expect } from '@playwright/test';

const apiBaseURL =
  process.env.API_BASE_URL ?? 'http://localhost:8080';

test.describe('API - Medidores', () => {
  test('GET /health responde correctamente', async ({ request }) => {
    const response = await request.get(`${apiBaseURL}/health`);

    expect(response.status()).toBe(200);
  });

  test('getAll requiere autenticación', async ({ request }) => {
    const response = await request.post(
      `${apiBaseURL}/api/v1/meter/getAll`,
      {
        data: {
          pagination: { page: 1, size: 10 },
        },
      },
    );

    expect(response.status()).toBe(401);
  });
});
