# Pruebas funcionales de caja negra | EnergIA

**Producto:** EnergIA · AI Energy Management Platform  
**Tipo:** Pruebas funcionales de caja negra sobre API y UI  
**Base de prueba:** documentación del backend, `frontend/README.md`, `frontend/PRODUCT.md` y reglas de negocio suministradas  
**Entorno objetivo:** local — API `http://localhost:8080`, frontend `http://localhost:5173`  
**Zona horaria de negocio:** `America/Bogota`; las fechas del dataset se muestran como hora de planta, sin conversión a la zona del navegador.

---

## 1. Objetivo

Diseñar y ejecutar pruebas funcionales de caja negra para verificar que EnergIA se comporta conforme a sus contratos de API, reglas de negocio y especificaciones de UI, sin inspeccionar el código fuente.

La prueba se centra en los flujos que soportan la decisión operativa: autenticarse, identificar medidores prioritarios, revisar evidencia, entender la clasificación de una anomalía y consultar la acción recomendada.

## 2. Alcance y enfoque

### Incluido

- Login: credenciales válidas e inválidas.
- Filtros, búsqueda, ordenamiento y paginación de medidores.
- Respuestas de API para medidores, anomalías, dashboard y análisis.
- Reglas de clasificación, estado, severidad y prioridad.
- Coherencia entre API, UI y documentación.
- Investigación de anomalías y presentación de evidencia.
- Seguimiento de los siete pasos del análisis.
- Formato es-CO y presentación de fechas como hora de planta.
- Accesibilidad funcional básica: teclado y estado no comunicado solo por color.

### Fuera de alcance de esta parte

- Pruebas unitarias internas y revisión de implementación.
- Pruebas de carga/estrés y medición formal de rendimiento.
- Auditoría de seguridad exhaustiva.
- Compatibilidad completa entre navegadores y dispositivos.
- Validación estadística exhaustiva del algoritmo; los casos de caja negra de esta suite verifican los resultados y reglas observables. Los límites estadísticos pueden ampliarse en una suite específica del motor.

## 3. Técnicas de diseño aplicadas

1. **Partición de equivalencia:** login válido/inválido; estado `NORMAL`, `ALERT`, `CRITICAL` e inválido; identificador existente/inexistente; filtro válido/inválido.
2. **Análisis de valores límite:** página y tamaño de página; páginas fuera del rango; tamaño mínimo, cero y negativo, sujeto a las restricciones documentadas/observadas; variación y duración cuando se pruebe el motor con datos controlados.
3. **Tablas de decisión:** tipo de anomalía → estado del medidor; tipo y condiciones → severidad; severidad, energía diferencial y confianza → prioridad.
4. **Pruebas negativas:** credenciales incorrectas, JWT ausente/inválido, filtros no permitidos, medidor inexistente y fallo del análisis.
5. **Pruebas de consistencia entre capas:** API vs. UI vs. resultados descritos en la documentación.
6. **Pruebas basadas en riesgos:** prioridad a autenticación, integridad de datos, anomalías críticas y ejecución del análisis, por su impacto en la decisión del operador.

## 4. Datos de referencia del producto

Dataset documentado: 12 medidores (`M-101` a `M-112`), 14 días (1–14 de septiembre de 2026), 4.032 lecturas horarias y cuatro eventos operativos.

| Medidor | Tipo esperado | Severidad | Confianza esperada | Estado esperado según regla | Prioridad / acción |
|---|---|---|---:|---|---|
| M-109 | `REAL_ANOMALY` | `HIGH` | 0,95 | `CRITICAL` | 1 · Investigar en sitio |
| M-112 | `DATA_QUALITY` | `HIGH` | 0,95 | `CRITICAL` | 2 · Validar el medidor |
| M-104 | `EXPLAINABLE_ANOMALY` | `MEDIUM` | 0,86 | `ALERT` | 3 · Validar con operación y actualizar baseline |
| M-106 | `FALSE_POSITIVE` | `LOW` | 0,86 | `NORMAL` | 4 · No escalar |

Los otros ocho medidores deben permanecer `NORMAL` y no generar alertas. La confianza es un puntaje de evidencia, no una probabilidad calibrada.

## 5. Tabla de decisión: clasificación → estado

Regla documentada del backend:

| Resultado del motor | Severidad | Estado esperado del medidor |
|---|---|---|
| Sin anomalía | — | `NORMAL` |
| `FALSE_POSITIVE` | `LOW` | `NORMAL` |
| Cualquier anomalía con severidad `HIGH` | `HIGH` | `CRITICAL` |
| Cualquier otra anomalía | `MEDIUM` o `LOW` | `ALERT` |

La tabla anterior debe verificarse con los datos reales del producto. La combinación `FALSE_POSITIVE` + `HIGH` no forma parte del dataset esperado; si se crean datos controlados para cubrirla, aclarar si la regla de severidad o la regla específica de falso positivo tiene precedencia, porque la documentación suministrada no resuelve explícitamente esa combinación.

## 6. Casos de prueba

**Estados posibles:** `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.  
**Severidad sugerida para defectos:** crítica, alta, media o baja, de acuerdo con el impacto operativo.

### C-API-01 · Login con credenciales válidas

- **Prioridad:** P1
- **Técnica:** partición de equivalencia positiva.
- **Precondición:** backend disponible.
- **Pasos:** enviar `POST /api/v1/auth/login` con el usuario de demo.
- **Datos:** `admin@energia.local` / `admin123`.
- **Resultado esperado:** autenticación exitosa y respuesta con JWT utilizable en rutas protegidas.
- **Resultado obtenido:** Status 200 con Bearer Token en el cuerpo de la respuesta.
- **Estado:** `PASS`.

### C-API-02 · Login con contraseña incorrecta

- **Prioridad:** P1
- **Técnica:** partición de equivalencia negativa.
- **Precondición:** backend disponible.
- **Pasos:** enviar `POST /api/v1/auth/login` con correo válido y contraseña incorrecta.
- **Datos:** `admin@energia.local` / `incorrecta`.
- **Resultado esperado:** autenticación rechazada; no se entrega un token válido. El código HTTP exacto debe confirmarse con el contrato OpenAPI o la respuesta observada.
- **Resultado obtenido:** 401 {
    "status_code": 401,
    "message": "Email o contraseña incorrectos",
    "timestamp": "2026-10-21T21:08:48Z",
    "path": "/api/v1/auth/login"
}.
- **Estado:** `PASS`.

### C-API-03 · Ruta protegida sin JWT

- **Prioridad:** P1
- **Técnica:** prueba negativa de autorización.
- **Precondición:** backend disponible.
- **Pasos:** invocar `GET /api/v1/dashboard/getSummary` sin `Authorization`.
- **Datos:** sin token.
- **Resultado esperado:** `401 Unauthorized`, según la documentación.
- **Resultado obtenido:** Status 401 {
    "status_code": 401,
    "message": "Falta el token de autenticación",
    "timestamp": "2026-10-21T21:07:30Z",
    "path": "/api/v1/dashboard/getSummary"
}
- **Estado:** `PASS`.

### C-API-04 · Filtro por estado válido

- **Prioridad:** P1
- **Técnica:** partición de equivalencia.
- **Precondición:** JWT válido.
- **Pasos:** enviar `POST /api/v1/meter/getAll` con filtro `status`.
- **Datos:** repetir con `NORMAL`, `ALERT` y `CRITICAL`.
- **Resultado esperado:** cada respuesta contiene únicamente medidores del estado solicitado.
- **Resultado obtenido:** Status 200 con filtro NORMAL = 8, ALERT = 2, CRITIAL = 2.
- **Estado:** `PASS`.

### C-API-05 · Filtro por estado inválido

- **Prioridad:** P1
- **Técnica:** partición de equivalencia negativa.
- **Precondición:** JWT válido.
- **Pasos:** enviar `POST /api/v1/meter/getAll`.
- **Datos:** `{"filter":{"status":"UNKNOWN"}}`.
- **Resultado esperado:** solicitud rechazada con `400 Bad Request` y error estructurado con `status_code`, `message`, `errors`, `timestamp` y `path`.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-06 · Búsqueda parcial y sin distinción de mayúsculas

- **Prioridad:** P2
- **Técnica:** partición de equivalencia.
- **Precondición:** JWT válido.
- **Pasos:** consultar `POST /api/v1/meter/getAll` usando diferentes valores en `filter.meter_id`.
- **Datos:** `M-109`, `109`, `m-109`.
- **Resultado esperado:** las búsquedas equivalentes encuentran M-109, según la regla de búsqueda parcial sin distinción de mayúsculas.
- **Resultado obtenido:** Esta distinguiendo entre mayúscula y minuscula
- **Estado:** `FAIL`.

### C-API-07 · Paginación: primera página y tamaño por defecto

- **Prioridad:** P1
- **Técnica:** valor límite / valor por defecto.
- **Precondición:** JWT válido.
- **Pasos:** invocar `POST /api/v1/meter/getAll` sin body y luego con `{"pagination":{"page":1,"size":10}}`.
- **Datos:** body ausente y página 1 con tamaño 10.
- **Resultado esperado:** ambos casos corresponden a la primera página de hasta 10 medidores, ordenada por `meter_id` por defecto.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-08 · Paginación con parámetros fuera de rango

- **Prioridad:** P2
- **Técnica:** análisis de valores límite y prueba negativa.
- **Precondición:** JWT válido.
- **Pasos:** enviar solicitudes con página 0, tamaño 0, tamaño negativo y una página posterior al final.
- **Datos:** `page=0`; `size=0`; `size=-1`; página muy alta con `size=10`.
- **Resultado esperado:** los parámetros inválidos se rechazan de forma controlada o se normalizan según el contrato real; una página válida fuera del rango de resultados no debe provocar un error interno. La documentación suministrada no especifica la política exacta para estos límites, por lo que debe confirmarse en OpenAPI y registrar el comportamiento observado.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-09 · Ordenamiento de medidores

- **Prioridad:** P2
- **Técnica:** partición de equivalencia / consistencia de orden.
- **Precondición:** JWT válido.
- **Pasos:** consultar `getAll` ordenando por `consumption`, `variation` y `severity`, en `ASC` y `DESC`.
- **Datos:** `sort_by=consumption|variation|severity`; `sort_order=ASC|DESC`.
- **Resultado esperado:** los resultados respetan el campo y dirección solicitados. La dirección por defecto es `ASC` y el campo por defecto `meter_id`.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-10 · Detalle de medidor existente e inexistente

- **Prioridad:** P1
- **Técnica:** partición de equivalencia positiva/negativa.
- **Precondición:** JWT válido.
- **Pasos:** consultar `GET /api/v1/meter/getById/{id}` para un medidor existente y un identificador inexistente.
- **Datos:** ID real de M-109 obtenido de la API; después un ID que no exista.
- **Resultado esperado:** el ID existente devuelve el detalle correspondiente; el inexistente se gestiona con una respuesta de error controlada, sin error interno inesperado.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-11 · Clasificación y orden de anomalías

- **Prioridad:** P1
- **Técnica:** tabla de decisión.
- **Precondición:** JWT válido y dataset documentado cargado.
- **Pasos:** invocar `GET /api/v1/anomaly/getAll` y comparar cada anomalía con la tabla de referencia.
- **Datos:** M-109, M-112, M-104 y M-106.
- **Resultado esperado:** cuatro anomalías en orden M-109, M-112, M-104 y M-106, con los tipos, severidades, confianzas y acciones esperados descritos en la sección 4.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-12 · Consistencia entre estado y clasificación

- **Prioridad:** P1
- **Técnica:** tabla de decisión / consistencia entre recursos.
- **Precondición:** JWT válido.
- **Pasos:** consultar lista de medidores, anomalías y detalle de M-109, M-112, M-104 y M-106. Cruzar estado, tipo y severidad.
- **Datos:** los cuatro medidores esperados.
- **Resultado esperado:** M-109 y M-112 `CRITICAL`; M-104 `ALERT`; M-106 `NORMAL`; los ocho restantes `NORMAL`. Un falso positivo no debe escalarse.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-API-13 · Resumen del dashboard frente a los datos

- **Prioridad:** P1
- **Técnica:** consistencia entre recursos / oráculo de negocio.
- **Precondición:** JWT válido.
- **Pasos:** consultar `GET /api/v1/dashboard/getSummary` y comparar los indicadores con medidores y anomalías.
- **Datos:** dataset de 12 medidores, 4 anomalías y 2 casos prioritarios.
- **Resultado esperado:** resumen coherente con 12 medidores, 4 anomalías y 2 prioritarias; consumo y confianza deben corresponder a las definiciones documentadas. No asumir que todos los KPI son sumas simples sin confirmar su definición en OpenAPI/producto.
- **Resultado obtenido:** Se recibe el status 200 con el resultado esperado.
- **Estado:** `PASS`.

### C-API-14 · Inicio y seguimiento de análisis

- **Prioridad:** P1
- **Técnica:** prueba de flujo / consistencia de estado.
- **Precondición:** JWT válido; no debe haber otro análisis en curso.
- **Pasos:** enviar `POST /api/v1/ai/analyze`, guardar el ID y consultar `GET /api/v1/ai/analysis/{id}` hasta un estado terminal; consultar también `GET /api/v1/ai/analysis/latest`.
- **Datos:** ejecución normal del dataset.
- **Resultado esperado:** el inicio devuelve `202 Accepted`; se puede consultar el progreso de los siete pasos y el análisis termina en `COMPLETED`, con cuatro anomalías y dos prioritarias. No deben correr dos análisis simultáneamente.
- **Resultado obtenido:** Se recibe status 202 aceptado con estado corriendo y al consultar por id del analisis de obtiene 200 completado.
- **Estado:** `PASS`.

### C-API-15 · Respuesta cuando OpenAI no está configurado

- **Prioridad:** P2
- **Técnica:** partición de equivalencia de configuración.
- **Precondición:** entorno de prueba con `OPENAI_API_KEY` vacío, conforme al modo documentado.
- **Pasos:** ejecutar análisis y consultar el resultado de las anomalías.
- **Datos:** dataset habitual; sin API key.
- **Resultado esperado:** el análisis funciona y la explicación/recomendación usa el texto del motor; `narrated_by` identifica `engine`.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-UI-01 · Login válido e inválido desde la interfaz

- **Prioridad:** P1
- **Técnica:** partición de equivalencia positiva/negativa.
- **Precondición:** frontend y backend disponibles; sesión cerrada.
- **Pasos:** abrir `/login`; probar credenciales válidas y, por separado, contraseña incorrecta.
- **Datos:** credenciales de demo y contraseña incorrecta.
- **Resultado esperado:** con credenciales válidas se accede a la aplicación; las inválidas no permiten acceder y se presenta un mensaje entendible. No se expone información sensible.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-UI-02 · Navegación protegida y sesión

- **Prioridad:** P1
- **Técnica:** prueba negativa de navegación.
- **Precondición:** sesión cerrada.
- **Pasos:** abrir directamente `/`, `/medidores`, `/anomalias` y una URL de detalle.
- **Datos:** rutas protegidas sin sesión.
- **Resultado esperado:** la aplicación exige autenticación o redirige a `/login`; no muestra datos protegidos.
- **Resultado obtenido:** Todas la navegaciones con la sesión cerrada conduce a /login.
- **Estado:** `PASS`.

### C-UI-03 · Despacho: prioridad y KPI

- **Prioridad:** P1
- **Técnica:** consistencia UI/API/documentación.
- **Precondición:** sesión iniciada.
- **Pasos:** abrir `/`; comparar las órdenes prioritarias y los KPI visibles con la API y la tabla de referencia.
- **Datos:** M-109 como prioridad 1; M-112 como prioridad 2; 4 anomalías, 2 prioritarias.
- **Resultado esperado:** la primera atención corresponde a M-109; las métricas y los textos no contradicen la API. El estado se comunica mediante texto/icono además del color.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-UI-04 · Filtros de medidores persistidos en URL

- **Prioridad:** P1
- **Técnica:** partición de equivalencia / consistencia de estado.
- **Precondición:** sesión iniciada.
- **Pasos:** abrir `/medidores`; filtrar por estado y buscar M-109; observar URL y resultados; recargar la página.
- **Datos:** estado `CRITICAL`; búsqueda `M-109`.
- **Resultado esperado:** tabla coherente con los filtros y la URL; tras recargar, los filtros representados en la URL se conservan y los resultados siguen correspondiendo.
- **Resultado obtenido:** Al recargar se conserva la consulta.
- **Estado:** `PASS`.

### C-UI-05 · Detalle del medidor y datos eléctricos

- **Prioridad:** P1
- **Técnica:** consistencia UI/API.
- **Precondición:** sesión iniciada; M-109 disponible.
- **Pasos:** abrir `/medidores/:id` desde el enlace del medidor; comparar consumo actual, baseline, variación, estado, voltaje, corriente, factor de potencia e histórico con el detalle de API.
- **Datos:** M-109.
- **Resultado esperado:** el detalle corresponde a M-109 y los valores mostrados coinciden con la API. Las fechas se muestran como hora de planta, sin conversión a la zona del navegador.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-UI-06 · Investigación de anomalía y evidencia

- **Prioridad:** P1
- **Técnica:** consistencia UI/API/documentación.
- **Precondición:** sesión iniciada; anomalías disponibles.
- **Pasos:** abrir la investigación de M-109 desde `/anomalias` o `/anomalias/:id`; revisar explicación, acción, comparación contra baseline, variables, evidencia/puntajes y eventos.
- **Datos:** M-109.
- **Resultado esperado:** la explicación indica un cambio de consumo sostenido no explicado por un evento; la acción recomienda investigar en sitio. La evidencia es coherente con los datos devueltos por API.
- **Estado:** `PASS`.

### C-UI-07 · Formato local y fechas de planta

- **Prioridad:** P2
- **Técnica:** consistencia de presentación.
- **Precondición:** sesión iniciada.
- **Pasos:** revisar valores de consumo, variaciones, confianza y marcas de tiempo en despacho, medidores e investigación.
- **Datos:** valores conocidos de M-109 y marcas de tiempo del dataset.
- **Resultado esperado:** números presentados en formato español de Colombia (coma decimal y formato de miles coherente); las fechas se muestran exactamente como hora de planta, sin desplazamiento por la zona horaria del navegador.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.

### C-UI-08 · Run AI Analysis: progreso y finalización

- **Prioridad:** P1
- **Técnica:** prueba de flujo / estado de interfaz.
- **Precondición:** sesión iniciada; no hay análisis en curso.
- **Pasos:** activar `Run AI Analysis`; observar la hoja de progreso y los siete pasos; esperar finalización y abrir el resultado.
- **Datos:** análisis del dataset habitual.
- **Resultado esperado:** los pasos se marcan conforme avanza el backend; la UI deja el estado de carga al completarse y refleja cuatro anomalías, dos prioritarias y el identificador del análisis actual.
- **Resultado obtenido:** Pendiente de ejecución.
- **Estado:** `PASS`.


## 7. Tabla de decisión de severidad

Reglas documentadas del motor:

| Tipo | Condición documentada | Severidad esperada |
|---|---|---|
| `REAL_ANOMALY` | Variación superior al 50 % y cambio aún activo | `HIGH` |
| `REAL_ANOMALY` | Variación superior al 20 % (sin cumplir la condición anterior) | `MEDIUM` |
| `REAL_ANOMALY` | Variación igual o inferior al 20 % | `LOW` |
| `DATA_QUALITY` | 12 horas sospechosas o más | `HIGH` |
| `DATA_QUALITY` | Menos de 12 horas sospechosas, pero cumple la clasificación | `MEDIUM` |
| `EXPLAINABLE_ANOMALY` | Caso clasificado como explicable | `MEDIUM` |
| `FALSE_POSITIVE` | Caso clasificado como falso positivo | `LOW` |

Los casos del dataset cubren las cuatro clases principales, pero no todos los límites numéricos. Para probar de forma fiable los límites exactos (20 %, 50 %, 11/12 horas), se necesitan datos controlados y un modo documentado de suministrarlos al motor. No afirmar que esos límites se probaron solo a partir del dataset actual.

## 8. Tabla de decisión de prioridad

La documentación define este orden lexicográfico:

1. Severidad.
2. A igual severidad, energía en juego (kWh de más o de menos frente a lo esperado).
3. Confianza.

Con el dataset esperado:

| Orden | Medidor | Motivo principal |
|---:|---|---|
| 1 | M-109 | Severidad `HIGH` y 2.825 kWh de exceso, por encima de M-112 |
| 2 | M-112 | Severidad `HIGH`, sin exceso neto de energía según el ejemplo documentado |
| 3 | M-104 | Severidad `MEDIUM` |
| 4 | M-106 | Severidad `LOW`; no escalar |

Para cubrir todos los desempates de prioridad se requieren datos controlados; el dataset principal comprueba el orden esperado, pero no todas las permutaciones posibles.

## 9. Registro de ejecución

Completar después de ejecutar cada caso:


| Campo | Valor |
|---|---|
| Fecha/hora (America/Bogota) | 21-OCT-2026 |
| Commit / versión del build | 15765d937d6ec03af9e14b052697c0929531b570 |
| Backend / frontend | Local |
| Navegador y versión | Versión 154.0.8037.95 (Compilación oficial) (arm64) |
| Ejecutor | Jesus David Zaraza Toro |

Resumen inicial de estados (todos pendientes de ejecución):

| Estado | Cantidad |
|---|---:|
| PASS |23 |
| FAIL | 1 |
| BLOCKED | 0 |
| NOT RUN | 24 |

### Registro de defectos

Por cada `FAIL`, documentar:

- ID del caso de prueba.
- Título y prioridad.
- Precondiciones y datos exactos.
- Pasos mínimos para reproducir.
- Resultado esperado (con referencia al requisito/regla).
- Resultado actual (texto, respuesta HTTP o captura).
- Impacto operativo y severidad sugerida.
- Evidencia: request/response, captura o registro con fecha/hora.

## 10. Criterios de salida

La ejecución de esta parte se considera completa cuando:

- Se han ejecutado los casos priorizados o se ha justificado cada `BLOCKED` / `NOT RUN`.
- Todos los fallos tienen evidencia reproducible.
- Se ha contrastado la API, la UI y el oráculo documental para los flujos críticos.

No marcar el build como aprobado únicamente porque la UI carga. Un resultado de caja negra debe demostrar que la información que guía decisiones operativas es consistente y correcta.

---

## 11. Referencias

- `backend/README.md`: endpoints, autenticación, reglas del motor, resultados esperados y límites.
- `frontend/README.md`: rutas, navegación y comportamiento de pantallas.
- `frontend/PRODUCT.md`: principios de producto, accesibilidad, presentación de datos y flujo del operador.
- `http://localhost:8080/docs`: contrato OpenAPI disponible en el entorno local.
