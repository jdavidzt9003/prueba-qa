export const env = {
  baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
  username: process.env.E2E_USERNAME ?? '',
  password: process.env.E2E_PASSWORD ?? '',
  apiBaseURL: process.env.API_BASE_URL ?? 'http://localhost:8080',
};