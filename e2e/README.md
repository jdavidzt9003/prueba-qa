# E2E EnergIA — Playwright + TypeScript

## Requisitos
- Node.js y npm.
- Frontend levantado en `http://localhost:5173`.
- Backend levantado en `http://localhost:8080` para el smoke de API.
- Usuario de pruebas válido para las pruebas autenticadas.

## Instalación y ejecución
Desde la raíz del repositorio:

```bash
cd e2e
cp .env.example .env
# Completa E2E_USERNAME y E2E_PASSWORD en .env
pnpm install
pnpm playwright install chromium
pnpm test
```

Después de la instalación inicial, el comando para ejecutar la suite es `npm test`.

## Organización
- `playwright.config.ts`: configuración, proyecto de setup, Chromium, timezone Bogotá, HTML reporter, trace, screenshot y video en fallos.
- `pages/`: Page Objects de login y medidores.
- `tests/auth.setup.ts`: inicia sesión una vez y guarda `storageState`.
- `tests/meters.e2e.spec.ts`: flujo de negocio de búsqueda y detalle del medidor M-109.
- `tests/defect-data-quality.spec.ts`: candidato de regresión relacionado con el hallazgo estático de `DataQuality`.
- `tests/api.smoke.spec.ts`: smoke opcional de `/health`.
- `support/env.ts`: configuración por variables de entorno.

## Variables de entorno
Configura `BASE_URL`, `API_BASE_URL`, `E2E_USERNAME` y `E2E_PASSWORD` en `.env`.

## Reportes
- HTML: `npm run test:report`
- Trazas, capturas y videos: `test-results/`

## Ajustes que dependen de la UI real
Los locators de login, búsqueda, enlaces y etiquetas de anomalía usan roles y labels accesibles, pero deben contrastarse con el markup real. Si no coinciden, adapta los nombres accesibles o mejora la accesibilidad del frontend en lugar de recurrir a selectores CSS frágiles.

El test de DEF-001 se deja intencionalmente como candidato con `test.fail()`. Necesita datos o un fixture visible que reproduzca en la UI el caso `consumptionStable == false`; sin ese fixture no demuestra todavía un defecto E2E. El hallazgo original sí puede probarse de forma determinista mediante una prueba unitaria del backend.
