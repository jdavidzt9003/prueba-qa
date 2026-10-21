# Suite de pruebas Smoke — EnergIA

**Producto:** AI Energy Management Platform  
**Módulos:** Autenticación, medidores, anomalías, dashboard y análisis de IA  
**Tipo de prueba:** Smoke / verificación de build  
**Base de prueba:** README del backend y reglas de negocio proporcionadas  
**Entorno:** Local  
**Zona horaria de negocio:** `America/Bogota`

---

## 1. Objetivo

Verificar mediante un conjunto mínimo de pruebas que los componentes críticos de EnergIA están disponibles y que los flujos esenciales funcionan lo suficiente como para continuar con pruebas funcionales más profundas.

La suite prioriza disponibilidad, autenticación, consulta de información clave y ejecución/seguimiento del análisis de IA. No pretende validar exhaustivamente todos los cálculos estadísticos ni todas las combinaciones de filtros.

## 2. Alcance

### Incluido

- Disponibilidad del backend.
- Inicio de sesión y autenticación mediante JWT.
- Protección de rutas.
- Consulta del resumen del dashboard.
- Consulta, búsqueda y detalle de medidores.
- Consulta de anomalías y su orden de prioridad.
- Consulta del último análisis.
- Inicio y seguimiento de un análisis de IA.
- Validación básica de filtros y formato de errores.

### Fuera del alcance de esta suite

- Validación exhaustiva del algoritmo estadístico (mediana, MAD y z robusto).
- Pruebas de límites de duración del cambio sostenido y umbrales.
- Pruebas de carga, estrés, resistencia y rendimiento.
- Pruebas completas de seguridad, accesibilidad y compatibilidad entre navegadores.
- Validación exhaustiva de la integración con OpenAI y de todas sus fallas.
- Pruebas unitarias internas del motor; estas corresponden a una suite separada.

## 3. Precondiciones

1. Backend disponible en `http://localhost:8080`.
2. Frontend disponible en `http://localhost:5173`.
3. Dataset CSV presente y cargado por el backend al iniciar.
4. Credenciales locales por defecto disponibles:
   - Usuario: `admin@energia.local`
   - Contraseña: `admin123`
5. Swagger disponible en `http://localhost:8080/docs`.
6. No modificar los CSV durante la ejecución.
7. Registrar fecha/hora de ejecución, versión o commit del build y entorno usado.
8. Ejecutar los casos en un entorno controlado; si el análisis se ejecuta en segundo plano, consultar su estado hasta que termine.

## 4. Criterios de entrada

- El backend y el frontend arrancan sin errores bloqueantes.
- El endpoint de salud está accesible.
- Los datos de prueba están disponibles.
- Se conocen las credenciales de prueba.

Si alguna condición no se cumple, registrar el bloqueo como hallazgo y continuar con las pruebas que sí puedan ejecutarse.

## 5. Casos de prueba

| ID | Prioridad | Caso | Pasos / solicitud | Resultado esperado | Estado |
|---|---|---|---|---|---|
| SMK-01 | P1 | Salud del backend | Enviar `GET /health` sin autenticación. | El servidor responde satisfactoriamente y reporta estado saludable. | HALLAZGO - HAL-001|
| SMK-02 | P1 | Login válido y consulta del usuario | Enviar `POST /api/v1/auth/login` con `{"email":"admin@energia.local","password":"admin123"}`. Usar el JWT recibido en `GET /api/v1/auth/me` con `Authorization: Bearer <token>`. | Login exitoso; se recibe un token y `/auth/me` identifica al usuario autenticado. | `PASS` |
| SMK-03 | P1 | Rutas protegidas sin token | Consultar una ruta protegida, por ejemplo `GET /api/v1/dashboard/getSummary`, sin `Authorization`. Repetir con un token inválido si aplica. | La API rechaza la petición no autenticada con `401 Unauthorized`. | FAILED |
| SMK-04 | P1 | Resumen del dashboard | Con token válido, enviar `GET /api/v1/dashboard/getSummary`. | Respuesta satisfactoria con los indicadores del dashboard. Los valores deben ser coherentes con el dataset y el resultado del motor; el resultado documentado incluye 12 medidores, 4 anomalías y 2 casos de atención prioritaria. | PASS |
| SMK-05 | P1 | Lista de medidores | Con token, enviar `POST /api/v1/meter/getAll` con `{"pagination":{"page":1,"size":10}}`. | Respuesta satisfactoria con una página de medidores; la API documenta tamaño predeterminado de 10 si no se envía body. | PASS |
| SMK-06 | P1 | Búsqueda y detalle de medidor | Con token, buscar `M-109` usando `POST /api/v1/meter/getAll` con `{"filter":{"meter_id":"M-109"}}`. Luego consultar `GET /api/v1/meter/getById/{id}` usando el identificador real devuelto por la API. | Se encuentra el medidor y su detalle corresponde al mismo medidor. La documentación también indica que la búsqueda parcial no distingue mayúsculas/minúsculas; puede verificarse `109` como comprobación adicional. |  PASS |
| SMK-07 | P1 | Lista de anomalías y prioridad | Con token, enviar `GET /api/v1/anomaly/getAll`. | Se obtienen las 4 anomalías ordenadas por prioridad: M-109, M-112, M-104 y M-106. Sus tipos/severidades esperados son `REAL_ANOMALY/HIGH`, `DATA_QUALITY/HIGH`, `EXPLAINABLE_ANOMALY/MEDIUM` y `FALSE_POSITIVE/LOW`, respectivamente. | PASS |
| SMK-08 | P1 | Último análisis | Con token, enviar `GET /api/v1/ai/analysis/latest`. | Se puede consultar el último análisis; su identificador, estado y resumen son coherentes con el estado actual del servicio. Si el sistema acaba de iniciar y aún no hay análisis disponible, registrar el comportamiento observado. | PASS |
| SMK-09 | P1 | Ejecutar y seguir análisis de IA | Con token, enviar `POST /api/v1/ai/analyze`. Capturar el identificador devuelto y consultar `GET /api/v1/ai/analysis/{id}` hasta alcanzar estado terminal. | La petición de inicio responde `202 Accepted`; el análisis avanza por los pasos documentados y termina en `COMPLETED`. El resultado contiene 4 anomalías y 2 casos prioritarios. No se deben lanzar dos análisis simultáneos. | PASS |
| SMK-10 | P2 | Filtro inválido y contrato de error | Con token, enviar `POST /api/v1/meter/getAll` con un estado inválido, por ejemplo `{"filter":{"status":"UNKNOWN"}}`. | La API rechaza el filtro y devuelve el formato de error documentado: `status_code`, `message`, `errors`, `timestamp` y `path`. El README ejemplifica `400 Bad Request` para filtros inválidos. | PASS |


## 6. Validaciones complementarias de UI

Además de la suite API, hacer una pasada visual breve por el frontend:

| ID | Pantalla / flujo | Verificación | Estado |
|---|---|---|---|
| UI-SMK-01 | Login | Se puede iniciar sesión con las credenciales de prueba y acceder a la aplicación. | PASS |
| UI-SMK-02 | Despacho | Se muestran el resumen de planta, la orden de prioridad principal y los accesos a los módulos. | PASS |
| UI-SMK-03 | Medidores | La tabla carga y permite realizar una búsqueda básica de medidor. | FAILED |
| UI-SMK-04 | Anomalías IA | Se muestran las anomalías, sus prioridades, tipos, severidades y acciones recomendadas. | PASS |
| UI-SMK-05 | Run AI Analysis | La interfaz refleja el inicio y el resultado final del análisis sin quedarse indefinidamente en estado de carga. | PASS |

La pasada de UI complementa la suite API.

## 7. Criterios de salida

La suite se considera satisfactoria para recomendar que el build continúe a pruebas funcionales cuando:

- Todos los casos P1 ejecutados pasan.
- No hay defectos bloqueantes en autenticación, disponibilidad, consulta de datos o análisis.
- Las anomalías y prioridades principales concuerdan con el resultado documentado.
- Los fallos, bloqueos y pruebas no ejecutadas están identificados y tienen evidencia.
- Los defectos se registran con pasos para reproducirlos, resultado esperado, resultado actual, severidad, evidencia y entorno.

Un caso `BLOCKED` o `NOT RUN` no debe contarse como `PASS`. Si falla un caso P1, recomendar detener o limitar las pruebas posteriores hasta evaluar el impacto.

## 8. Registro de ejecución

Completar durante la ejecución:

| Campo | Valor |
|---|---|
| Fecha/hora (America/Bogota) | 21-OCT-2026 |
| Commit / versión del build | 15765d937d6ec03af9e14b052697c0929531b570 |
| Backend / frontend | Local |
| Navegador y versión | Versión 154.0.8037.95 (Compilación oficial) (arm64) |
| Ejecutor | Jesus David Zaraza Toro |

| Resultado | Cantidad |
|---|---:|
| PASS | 12 |
| FAIL | 3 |
| BLOCKED | 0 |
| NOT RUN | 0 |

**Hallazgos / observaciones:**  
- El build genera defectos que no bloquean su etapa posterior en pruebas funcionales. Estos tres defectos en Smoke test, son reportados para solución.

## 9. Notas de riesgo detectadas en el diseño

- Confirmar que los valores del dashboard usan las mismas ventanas de tiempo y definiciones que la tabla de medidores antes de declarar una discrepancia.
- La regla documentada establece que un `FALSE_POSITIVE` debe mapear a estado `NORMAL`; comprobar la coherencia entre estado del medidor, clasificación de anomalía y acción recomendada.
- El endpoint de análisis trabaja en segundo plano y no permite dos análisis simultáneos; evitar que las pruebas provoquen ejecuciones concurrentes.
- La confianza es un puntaje de evidencia limitado a 0,50–0,95, no una probabilidad calibrada.
- El backend carga los CSV al arrancar y mantiene el resultado en memoria; los cambios en los CSV requieren reiniciar el servicio para ser considerados.

--- 

**Referencia principal:** documentación del backend y reglas de negocio proporcionadas para el reto EnergIA.
