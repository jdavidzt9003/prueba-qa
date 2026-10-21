import { test, expect } from '@playwright/test';
import { env } from '../support/env';

test('API smoke: health responde correctamente', async ({ request }) => {
  const response = await request.get(`${env.apiBaseURL}/health`);
  expect(response.ok()).toBeTruthy();
});
