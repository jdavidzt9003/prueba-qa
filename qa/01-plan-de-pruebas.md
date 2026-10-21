# Plan de pruebas — EnergIA

**Versión:** 1.0  
**Enfoque:** pruebas basadas en riesgos (Risk-Based Testing)  
**Referencia:** ISTQB CTFL v4.0  
**Entorno:** frontend React y backend Go ejecutados localmente. Zona horaria de negocio: `America/Bogota`.

## 1. Objetivo

Verificar que EnergIA permita autenticar al operador, consultar información consistente de los medidores, identificar y priorizar anomalías, y ejecutar y consultar el estado del análisis de IA. Se dará prioridad a los defectos que puedan ocultar situaciones eléctricas críticas, alterar la información presentada al operador o impedir su actuación.

## 2. Alcance

**Incluido en esta fase**

- Autenticación, validación de sesión y manejo de errores de acceso.
- Carga del dashboard y consistencia de sus indicadores.
- Consulta, filtrado, ordenamiento y paginación de medidores.
- Consulta del detalle de un medidor, su consumo, baseline, lecturas eléctricas, históricos y eventos.
- Consulta de anomalías, clasificación, severidad, confianza, prioridad y recomendaciones.
- Inicio y seguimiento del análisis de IA, incluidos estados, etapas y resumen.
- Validaciones de API, navegación principal, estados de carga y presentación de errores.
- Validación de fechas, horas y zona horaria de Colombia cuando aplique.

**Fuera del alcance inicial**

- Pruebas de carga, estrés.
- Pruebas de seguridad o pruebas de penetración.
- Validación física de los medidores y de las instalaciones eléctricas reales.
- Validación científica del modelo de IA con un conjunto estadístico independiente.
- Compatibilidad exhaustiva entre navegadores y dispositivos.

Estos puntos podrán abordarse en fases posteriores, según los riesgos identificados y el tiempo disponible.

## 3. Análisis de riesgos

| Prioridad | Riesgo | Impacto | Verificación principal |
|---|---|---|---|
| P1 — Crítica | Una anomalía real no se detecta, se clasifica incorrectamente o queda mal priorizada. | El operador podría no investigar un problema eléctrico relevante. | API de anomalías, reglas de clasificación y UI. |
| P1 — Crítica | El dashboard muestra consumos, estados o prioridades inconsistentes con los datos del backend. | Decisiones operativas basadas en información incorrecta. | Contrastar resumen, medidores y anomalías mediante API. |
| P1 — Crítica | El análisis de IA no inicia, falla silenciosamente o muestra un estado incorrecto. | Se pierde la capacidad de detectar y explicar cambios de consumo. | Inicio del análisis, seguimiento y resultado final. |
| P1 — Crítica | El detalle del medidor presenta datos eléctricos, baseline o lecturas incorrectos. | Una investigación puede dirigirse a una causa equivocada. | Comparar respuesta del detalle con la información visible. |
| P2 — Alta | Filtros, ordenamiento o paginación devuelven resultados incorrectos. | El operador puede omitir medidores relevantes. | Casos de filtros, orden y límites de paginación. |
| P2 — Alta | La sesión se pierde o no se valida correctamente. | Acceso interrumpido o exposición de información protegida. | Login, token y endpoint de usuario autenticado. |
| P2 — Alta | Fechas o eventos se muestran con una hora incorrecta. | La correlación temporal de una anomalía puede ser errónea. | Contratos de fecha, zona horaria y presentación. |
| P3 — Media | Errores visuales, textos truncados o navegación inconsistente. | Dificultad de uso y menor eficiencia del operador. | Inspección de UI y navegación. |

La prioridad es preliminar y se basa en el impacto potencial sobre la operación. Se ajustará con la probabilidad, exposición y evidencia de los defectos encontrados.

## 4. Tipos y niveles de prueba

- **Pruebas unitarias:** lógica de clasificación, cálculos de variación porcentual, priorización, validaciones y transiciones de estado. Se ejecutarán si están disponibles los tests del proyecto.
- **Pruebas de integración/API:** autenticación, contratos HTTP, códigos de respuesta, esquemas, filtros, paginación, datos de medidores, anomalías y ciclo de vida del análisis.
- **Pruebas de sistema/UI:** acceso, navegación, dashboard, consulta de medidores, anomalías, estados y mensajes de error.
- **Pruebas de regresión:** repetición de los casos de humo después de corregir defectos.
- **Pruebas exploratorias:** búsqueda de inconsistencias entre las pantallas y las respuestas del backend, especialmente en escenarios de prioridad crítica y falsos positivos.

La automatización se concentrará inicialmente en API y flujos de UI de alto riesgo. Las verificaciones de interfaz se complementarán con aserciones sobre los datos recibidos por API.

## 5. Criterios de entrada

- Frontend y backend iniciados y accesibles.
- Credenciales de prueba disponibles.
- Swagger y documentación del producto accesibles.
- Datos de prueba cargados y endpoints necesarios operativos.
- Alcance y resultados esperados identificados.
- Evidencias y herramienta de ejecución disponibles.

## 6. Criterios de salida

- Todos los casos de humo críticos ejecutados o documentados como bloqueados.
- Sin defectos P1 abiertos para considerar el build apto para continuar pruebas.
- Resultados esperados contrastados con evidencia observable.
- Defectos registrados con pasos de reproducción, resultado esperado, resultado actual y severidad.
- Casos no ejecutados, limitaciones y riesgos residuales comunicados explícitamente.

Un resultado de humo satisfactorio permite continuar las pruebas; no demuestra por sí mismo que el producto esté libre de defectos.