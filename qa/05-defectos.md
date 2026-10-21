# Defectos

## Hallazgos prueba de Humo

* **DEF-001 — El endpoint /health no aparece documentado en Swagger**

**Severidad:** Baja

**Precondición:** El backend de EnergIA está levantado y Swagger está disponible.

**Entorno:** Documentación swagger.

**Pasos para reproducir:**
1. Abrir la interfaz Swagger del backend.
2. Revisar los endpoints documentados.
3. Buscar el endpoint GET /health.
4. Comprobar que no aparece en la documentación.

**Resultado actual:** El endpoint responde en el backend, pero no se encuentra documentado en Swagger.

**Resultado esperado:** Si el alcance de documentación incluye los endpoints operativos, GET /health debe estar documentado, indicando su propósito, respuesta esperada y posibles códigos HTTP.

**Impacto:** Los consumidores y desarrolladores no pueden descubrir este endpoint desde la documentación de la API.

---

DEF-002 — Swagger documenta incorrectamente la respuesta HTTP 401

**Severidad:** Media

**Entorno:** API / Documentación
Estado: Reproducido en Swagger

**Precondición:** Backend disponible y documentación Swagger accesible.

**Pasos para reproducir:**
1. Abrir Swagger.
2. Consultar la operación GET /api/v1/dashboard/getSummary.
3. Revisar la respuesta documentada 401 Unauthorized.
4. Ejecutar el endpoint sin token de autenticación.
5. Comparar el cuerpo recibido con el ejemplo de Swagger.

**Resultado actual:** El endpoint responde con HTTP 401 y el mensaje "Falta el token de autenticación". Sin embargo, el ejemplo mostrado en Swagger contiene status_code: 404 y "Recurso no encontrado".

**Resultado esperado:** La documentación de 401 debe mostrar un ejemplo coherente con el error de autenticación real, con el código, mensaje, ruta y estructura correspondientes.

Impacto: Los desarrolladores pueden interpretar incorrectamente los errores y construir un manejo de excepciones equivocado en sus clientes.

----

DEF-003 — El botón «Siguiente» no permite navegar a la segunda página del Libro de medidores

**Módulo:** Medidores  
**Componente:** Tabla «Libro de medidores»  
**Tipo de defecto:** Funcional — Paginación  
**Prioridad:** Alta
**Severidad:** Media  
**Estado:** Reproducido manualmente

**Descripción:**
En la pantalla Medidores, la tabla «Libro de medidores» muestra un máximo de 10 registros por página. Sin embargo, existen 12 medidores registrados en total y el botón «Siguiente», ubicado en la parte inferior de la tabla, no permite avanzar a la segunda página para consultar los dos registros restantes.

**Precondiciones**
- La aplicación está disponible.
- El usuario ha iniciado sesión.
- Existen 12 medidores registrados en el sistema.

**Pasos para reproducir**
1. Iniciar sesión en la aplicación.
2. Ingresar al módulo **Medidores**.
3. Ubicar la tabla **Libro de medidores**.
4. Verificar que se muestran 10 registros en la primera página.
5. Ubicar el botón **Siguiente** en la parte inferior de la tabla.
6. Hacer clic en el botón.
7. Verificar si se muestran los dos medidores restantes.

**Resultado actual**
El botón «Siguiente» no permite avanzar a la página siguiente. El usuario solo puede consultar los primeros 10 medidores desde la tabla, aunque existen 12 registros en total.

**Resultado esperado**
Al hacer clic en «Siguiente», la tabla debe navegar a la segunda página y mostrar los dos medidores restantes. El sistema debe permitir consultar todos los registros mediante la paginación y mantener coherentes el número de página, los registros visibles y el total de resultados.

**Impacto**
Los usuarios no pueden consultar todos los medidores registrados desde la tabla, lo que limita la funcionalidad de navegación y puede impedir el acceso a información necesaria para sus tareas operativas.

**Evidencia:**
qa/evidencias/ev-defectos/DEF-003-smk-ui-png

---

DEF-004 El medidor M-106 permanece en estado ALERT pese a estar clasificado como FALSE_POSITIVE

**Tipo:** Defecto funcional  
**Módulo:** Medidores / Anomalías  
**Severidad:** Media  
**Prioridad:** Media    
**Ambiente:** Local / EnergIA  
**Medidor afectado:** M-106

**Descripción**

El medidor M-106 aparece con estado `ALERT` en la tabla de medidores, aunque en el módulo de anomalías el evento asociado está clasificado como `FALSE_POSITIVE`, con severidad `LOW`, confianza de `0,86` y acción «No escalar».

Este comportamiento contradice las reglas de negocio definidas para la correspondencia entre la clasificación de una anomalía y el estado del medidor.

**Precondiciones**

- La aplicación EnergIA está disponible.
- El usuario ha iniciado sesión correctamente.
- El medidor M-106 está registrado y visible en la tabla de medidores.
- Existe una anomalía de M-106 clasificada como `FALSE_POSITIVE`.

**Pasos para reproducir**

1. Iniciar sesión en EnergIA.
2. Navegar al módulo **Medidores**.
3. Buscar el medidor M-106 en la tabla.
4. Verificar que su estado aparece como `ALERT`.
5. Navegar al módulo **Anomalías**.
6. Buscar la anomalía asociada al medidor M-106.
7. Verificar que su clasificación es `FALSE_POSITIVE`, su severidad es `LOW` y la acción indicada es «No escalar».
8. Comparar el estado mostrado en Medidores con la regla de negocio aplicable.

**Resultado actual**

El medidor M-106 aparece con estado `ALERT`, pese a que la anomalía consultada está clasificada como `FALSE_POSITIVE`, con severidad `LOW` y acción «No escalar».

**Resultado esperado**

De acuerdo con las reglas de negocio definidas:

- Una anomalía clasificada como `FALSE_POSITIVE` debe corresponder al estado `NORMAL` del medidor.
- Una anomalía de severidad `HIGH` debe corresponder al estado `CRITICAL`.
- Las demás anomalías deben corresponder al estado `ALERT`.

Por lo tanto, M-106 debería aparecer en estado `NORMAL`, siempre que no exista otra anomalía activa independiente que justifique el estado `ALERT`.

**Impacto**

La inconsistencia puede inducir al usuario a interpretar que el medidor requiere atención cuando el evento asociado fue identificado como falso positivo y no debe escalarse. Esto puede generar alertas innecesarias, confusión operativa y pérdida de confianza en la información presentada por la aplicación.

**Evidencia:** qa/evidencias/ev-defectos/DEF-004-ui-appi.png

---
## Defectos pruebas funcionales

DEF-005 — El filtro por identificador no devuelve el medidor M-106

**Tipo:** Defecto funcional  
**Módulo:** Medidores  
**Componente:** API y frontend  
**Endpoint:** `POST /api/v1/meter/getAll`  
**Severidad inicial:** Media  

**Descripción**

Al consultar el listado de medidores utilizando el filtro `meter_id: "m-106"`, el endpoint responde `200 OK`, pero no devuelve registros. El mismo comportamiento se observa en la interfaz al buscar el medidor M-106.

**Pasos para reproducir**

1. Iniciar sesión en EnergIA.
2. Enviar una petición `POST /api/v1/meter/getAll` con el filtro `meter_id: "m-106"`.
3. Verificar que la respuesta es `200 OK` y no contiene registros.
4. Navegar al módulo Medidores y buscar m-106.
5. Verificar si la interfaz muestra el mismo resultado vacío.

**Resultado actual**

La API y la interfaz no muestran resultados para el filtro utilizado.

**Resultado esperado**

Si M-106 existe en el entorno y el filtro admite ese identificador, la consulta debe devolver el medidor correspondiente y la interfaz debe mostrarlo.

**Evidencia**
qa/evidencias/ev-defectos/DEF-005.png