# PLAN_BACK.md — Plan de Backend para CambioJoyasLourdes

> Análisis completo del frontend para adaptar (no reescribir desde cero) el backend existente.
> Fecha: 2026-03-15

---

## 1. Resumen del sistema

CambioJoyasLourdes es una app de gestión para una casa de cambio y compraventa de joyas.
El frontend consume una API REST con base `http://localhost:8080/api`.
Las 4 áreas funcionales que necesitan backend son:

| Área          | Descripción                                      |
|---------------|--------------------------------------------------|
| Operaciones   | CRUD de compras/ventas de divisas                |
| Deudores      | CRUD de clientes con deuda + acciones de gestión |
| Dashboard     | Stats agregados (balances, tendencias)           |
| Configuración | Preferencias de cuenta con historial             |

---

## 2. Entidades y modelos

### 2.1 `Moneda` (enum / catálogo)

Valores fijos que maneja el frontend:

```
EUR | USD | BRL | USDT
```

No necesita tabla propia si se guarda como `VARCHAR(4)`.

---

### 2.2 `Operacion`

Representa una compra o venta de divisas.

**Tabla: `operaciones`**

| Campo         | Tipo           | Notas                                  |
|---------------|----------------|----------------------------------------|
| id            | UUID / BIGINT  | PK, generado por el backend            |
| fecha_hora    | TIMESTAMP      | Momento exacto de la operación         |
| tipo          | ENUM/VARCHAR   | `'COMPRA'` o `'VENTA'`                 |
| activo_id     | VARCHAR(4)     | Código de moneda: `EUR`, `USD`, etc.   |
| monto         | DECIMAL(15,2)  | Cantidad de la moneda operada          |
| precio_compra | DECIMAL(10,4)  | Cotización de compra                   |
| precio_venta  | DECIMAL(10,4)  | Cotización de venta                    |
| creado_en     | TIMESTAMP      | Auditoría                              |

> **Por qué dos precios:** El frontend calcula el beneficio como
> `(sellPrice - buyPrice) * amount`. Si solo hay un campo `tasaCambio`,
> el beneficio siempre será 0. Tener `precio_compra` y `precio_venta`
> permite calcular la ganancia real por operación.

**Lo que el frontend ENVÍA al crear:**

```json
// POST /api/operaciones/compra  o  /api/operaciones/venta
// El servicio frontend enruta al endpoint según el campo tipo
{
  "tipo":       "COMPRA",
  "activoId":   "USD",
  "monto":      1000,
  "tasaCambio": 0.9200
}
```

**Mapeo frontend → backend:**

| Frontend (formulario) | Backend (DB)       |
|-----------------------|--------------------|
| `currency`            | `activo_id`        |
| `amount`              | `monto`            |
| `cotizacion`          | `precio_compra`    |
| `tipo` (`Compra`)     | `tipo` → `COMPRA`  |
| *(automático)*        | `fecha_hora`       |

**Lo que el frontend ESPERA recibir** (shape del adapter `operaciones.adapter.ts`):

```json
// Respuesta de GET /api/operaciones o GET /api/operaciones/:id
{
  "id":          "a1b2c3d4",
  "fechaHora":   "2026-03-15T14:30:00",
  "tipo":        "COMPRA",
  "activoId":    "USD",
  "monto":       1000,
  "tasaCambio":  0.9200
}
```

**Lo que el frontend muestra en la tabla Operaciones:**

| Columna    | Fuente                                          |
|------------|-------------------------------------------------|
| #          | `id`                                            |
| Fecha      | `fechaHora` (parte antes de la `T`)             |
| Moneda     | `activoId` → badge con símbolo (€, $, R$, ₮)   |
| Tipo       | `tipo` → badge verde (COMPRA) / rojo (VENTA)    |
| Cantidad   | `monto`                                         |
| Cotización | `tasaCambio` / `precio_compra`                  |
| Beneficio  | `(precio_venta - precio_compra) * monto`        |

**Filtros soportados en GET /api/operaciones:**

```
GET /api/operaciones?currency=USD&tipo=COMPRA&page=0&size=7
```

---

### 2.3 `Deudor` + `Deuda`

El frontend separa la persona (`Deudor`) de su deuda activa (`Deuda`).
El adapter `deudores.adapter.ts` recibe ambas y las combina.

**Tabla: `deudores`**

| Campo      | Tipo          | Notas                    |
|------------|---------------|--------------------------|
| id         | UUID / BIGINT | PK                       |
| nombre     | VARCHAR(150)  | Nombre completo          |
| documento  | VARCHAR(30)   | DNI / NIE / Pasaporte    |
| creado_en  | TIMESTAMP     | Auditoría                |

**Tabla: `deudas`**

| Campo              | Tipo                       | Notas                                          |
|--------------------|----------------------------|------------------------------------------------|
| id                 | UUID / BIGINT              | PK                                             |
| deudor_id          | FK → deudores              | Relación N:1                                   |
| operacion_id       | FK → operaciones (nullable)| Operación que originó la deuda                 |
| monto_pendiente    | DECIMAL(15,2)              | Importe de la deuda                            |
| fecha_vencimiento  | DATE                       | Vencimiento de pago                            |
| estado_actual      | ENUM/VARCHAR               | `VIGENTE`, `MORA`, `SALDADO`, `CERRADO`        |
| creado_en          | TIMESTAMP                  | Auditoría                                      |
| actualizado_en     | TIMESTAMP                  | Auditoría                                      |

**Lógica de estados de deuda:**

| Estado    | Cuándo aplica                                                     |
|-----------|-------------------------------------------------------------------|
| `VIGENTE` | Deuda activa, fecha_vencimiento en el futuro                      |
| `MORA`    | Deuda activa, fecha_vencimiento ya pasó (scheduler automático)    |
| `SALDADO` | Marcado manualmente como pagado via `POST /deudores/:id/saldar`   |
| `CERRADO` | Cerrado administrativamente                                       |

**Lo que el frontend ENVÍA al crear un deudor:**

```json
// POST /api/deudores
{
  "nombre":    "Juan García",
  "documento": "12345678A"
}
```

> **Nota importante:** El formulario tiene un campo `importe` pero el código
> en `AddDebtorModal.tsx` (línea 29-31) solo envía `nombre` y `documento`.
> La deuda se genera después via `POST /api/operaciones/:id/deuda?deudorId=`.

**Lo que el frontend ESPERA recibir** (GET /api/deudores):

```json
[
  {
    "id":         "uuid-deudor",
    "nombre":     "Juan García",
    "documento":  "12345678A",
    "deuda": {
      "id":                "uuid-deuda",
      "montoPendiente":    2500.00,
      "fechaVencimiento":  "2026-04-15",
      "estadoActual":      "VIGENTE",
      "deudorId":          "uuid-deudor"
    }
  },
  {
    "id":        "uuid-deudor-2",
    "nombre":    "María López",
    "documento": "87654321B",
    "deuda":     null
  }
]
```

> El adapter `deudorToFrontend(deudor, deuda?)` espera la deuda embebida
> en el objeto deudor. El backend debe hacer un JOIN y devolver la deuda
> activa (estado `VIGENTE` o `MORA`) dentro del objeto deudor.

**Lo que el frontend muestra en la tabla Deudores:**

| Columna | Fuente                                          |
|---------|-------------------------------------------------|
| Fecha   | `deuda.fechaVencimiento`                        |
| Nombre  | `deudor.nombre` + avatar (iniciales generadas)  |
| Importe | `deuda.montoPendiente`                          |
| Acción  | botón para "Marcar como pagado" (saldar)        |

**Acciones especiales de deudores:**

```
POST /api/deudores/:id/saldar
  → Cambia estado_actual de la deuda activa a 'SALDADO'
  → Devuelve: deudor con deuda actualizada

PUT /api/deudores/:id/extender
  → Body: { "nuevaFecha": "2026-05-01" }
  → Actualiza fecha_vencimiento de la deuda activa
  → Devuelve: deudor con deuda actualizada

PUT /api/deudores/:id
  → Body: { "nombre": "Juan García", "importe": 3000 }
  → Actualiza nombre del deudor y/o monto_pendiente de su deuda activa

DELETE /api/deudores/:id
  → Elimina deudor (y sus deudas en cascada, o soft-delete)

POST /api/operaciones/:id/deuda?deudorId=uuid
  → Crea una Deuda en tabla deudas con operacion_id y deudor_id
  → El monto_pendiente puede derivarse del monto de la operación
```

---

### 2.4 `Configuracion` + `ConfiguracionHistorial`

La página Settings permite editar saldos disponibles por moneda, cartera por defecto,
moneda por defecto e idioma. Cada vez que se guarda, se debe registrar el estado anterior.

**Tabla: `configuracion`** (una sola fila — single-user)

| Campo           | Tipo          | Notas                                              |
|-----------------|---------------|----------------------------------------------------|
| id              | BIGINT        | PK (siempre 1)                                     |
| saldo_eur       | DECIMAL(15,2) | Saldo disponible EUR                               |
| saldo_usd       | DECIMAL(15,2) | Saldo disponible USD                               |
| saldo_brl       | DECIMAL(15,2) | Saldo disponible BRL                               |
| saldo_usdt      | DECIMAL(15,2) | Saldo disponible USDT                              |
| cartera_defecto | VARCHAR(50)   | `Trading Account`, `Savings Account`, etc.         |
| moneda_defecto  | VARCHAR(4)    | `EUR`, `USD`, `BRL`, `USDT`                        |
| idioma          | VARCHAR(5)    | `es`, `en`, `pt`                                   |
| actualizado_en  | TIMESTAMP     | Cuándo fue el último cambio                        |

**Tabla intermedia: `configuracion_historial`** (historial de cambios)

| Campo              | Tipo          | Notas                                           |
|--------------------|---------------|-------------------------------------------------|
| id                 | BIGINT        | PK autoincremental                              |
| configuracion_id   | FK → configuracion | Referencia a la configuración principal    |
| saldo_eur          | DECIMAL(15,2) | Snapshot del saldo EUR en ese momento           |
| saldo_usd          | DECIMAL(15,2) | Snapshot del saldo USD                          |
| saldo_brl          | DECIMAL(15,2) | Snapshot del saldo BRL                          |
| saldo_usdt         | DECIMAL(15,2) | Snapshot del saldo USDT                         |
| cartera_defecto    | VARCHAR(50)   | Snapshot de la cartera elegida                  |
| moneda_defecto     | VARCHAR(4)    | Snapshot de la moneda por defecto               |
| idioma             | VARCHAR(5)    | Snapshot del idioma                             |
| cambiado_en        | TIMESTAMP     | Momento exacto del cambio                       |
| motivo             | VARCHAR(200)  | Opcional — descripción del cambio               |

**Flujo al guardar configuración (PUT /api/configuracion):**

```
1. Leer la configuración actual de la tabla configuracion
2. Insertar un snapshot de esos valores en configuracion_historial
3. Actualizar el registro en configuracion con los nuevos valores
4. Devolver la configuración actualizada
```

**Lo que el frontend ENVÍA al guardar:**

```json
// PUT /api/configuracion
{
  "saldoEur":       24580,
  "saldoUsd":       18450,
  "saldoBrl":       3000,
  "saldoUsdt":      750,
  "carteraDefecto": "Trading Account",
  "monedaDefecto":  "EUR",
  "idioma":         "es"
}
```

**Lo que el frontend ESPERA recibir (GET /api/configuracion):**

```json
{
  "saldoEur":       24580,
  "saldoUsd":       18450,
  "saldoBrl":       3000,
  "saldoUsdt":      750,
  "carteraDefecto": "Trading Account",
  "monedaDefecto":  "EUR",
  "idioma":         "es"
}
```

---

### 2.5 `DashboardStats`

No tiene tabla propia — es una vista calculada a partir de las demás tablas.
El dashboard muestra: balance total, saldos por moneda, serie histórica de 14 días,
tendencias mensuales de 6 meses, y las últimas 6 operaciones.

**Lo que el frontend ESPERA recibir (GET /api/dashboard/stats):**

```json
{
  "totalBalance":      46780.00,
  "totalBalanceTrend": "+12.5%",
  "trendUp":           true,
  "currencyBalances": [
    { "currency": "EUR",  "symbol": "€",  "amount": 24580 },
    { "currency": "USD",  "symbol": "$",  "amount": 18450 },
    { "currency": "BRL",  "symbol": "R$", "amount": 3000  },
    { "currency": "USDT", "symbol": "₮",  "amount": 750   }
  ],
  "portfolioSeries": [
    { "day": "01/03", "EUR": 22000, "USD": 16800, "BRL": 2600, "USDT": 600 },
    { "day": "02/03", "EUR": 22400, "USD": 17000, "BRL": 2650, "USDT": 620 }
    // ... 14 días
  ],
  "monthlyTrends": [
    { "month": "Ene", "balance": 18000, "debts": 9000 },
    { "month": "Feb", "balance": 19500, "debts": 8800 }
    // ... 6 meses
  ],
  "recentOperations": [
    // últimas 6 operaciones — mismo shape que GET /api/operaciones items
  ]
}
```

> `currencyBalances` viene directamente de los campos `saldo_*` de la tabla `configuracion`.
> `portfolioSeries` requiere un histórico de saldos o una vista calculada sobre operaciones.
> `monthlyTrends` requiere agregar operaciones y deudas por mes.

---

## 3. Mapa completo de endpoints

### 3.1 Operaciones

| Método | Endpoint                         | Descripción                                          |
|--------|----------------------------------|------------------------------------------------------|
| GET    | `/api/operaciones`               | Listar (filtros: `currency`, `tipo`, `page`, `size`) |
| GET    | `/api/operaciones/:id`           | Obtener por ID                                       |
| POST   | `/api/operaciones/compra`        | Crear operación de compra                            |
| POST   | `/api/operaciones/venta`         | Crear operación de venta                             |
| PUT    | `/api/operaciones/:id`           | Actualizar operación                                 |
| DELETE | `/api/operaciones/:id`           | Eliminar operación                                   |
| POST   | `/api/operaciones/:id/deuda`     | Generar deuda vinculada (`?deudorId=uuid`)           |

### 3.2 Deudores

| Método | Endpoint                         | Descripción                                          |
|--------|----------------------------------|------------------------------------------------------|
| GET    | `/api/deudores`                  | Listar con deuda activa embebida                     |
| GET    | `/api/deudores/:id`              | Obtener deudor + deuda                               |
| POST   | `/api/deudores`                  | Crear deudor                                         |
| PUT    | `/api/deudores/:id`              | Actualizar nombre e importe                          |
| DELETE | `/api/deudores/:id`              | Eliminar deudor                                      |
| POST   | `/api/deudores/:id/saldar`       | Marcar deuda activa como SALDADO                     |
| PUT    | `/api/deudores/:id/extender`     | Extender fecha de vencimiento de deuda activa        |

### 3.3 Dashboard

| Método | Endpoint                  | Descripción                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/dashboard/stats`    | Stats agregados del dashboard      |

### 3.4 Configuración

| Método | Endpoint                          | Descripción                                |
|--------|-----------------------------------|--------------------------------------------|
| GET    | `/api/configuracion`              | Obtener configuración actual               |
| PUT    | `/api/configuracion`              | Guardar config (guarda historial primero)  |
| GET    | `/api/configuracion/historial`    | Listar historial paginado                  |

---

## 4. Ejemplos completos de request / response

### 4.1 Crear operación de compra

```http
POST /api/operaciones/compra
Content-Type: application/json

{
  "tipo":       "COMPRA",
  "activoId":   "USD",
  "monto":      1000,
  "tasaCambio": 0.9200
}
```

```json
// 201 Created
{
  "id":         "a1b2c3d4",
  "fechaHora":  "2026-03-15T14:30:00",
  "tipo":       "COMPRA",
  "activoId":   "USD",
  "monto":      1000,
  "tasaCambio": 0.9200
}
```

---

### 4.2 Listar operaciones con filtros

```http
GET /api/operaciones?currency=USD&tipo=COMPRA&page=0&size=7
```

```json
// 200 OK
{
  "content": [
    {
      "id":         "a1b2c3d4",
      "fechaHora":  "2026-03-15T14:30:00",
      "tipo":       "COMPRA",
      "activoId":   "USD",
      "monto":      1000,
      "tasaCambio": 0.9200
    }
  ],
  "page":          0,
  "size":          7,
  "totalElements": 1,
  "totalPages":    1
}
```

---

### 4.3 Crear deudor

```http
POST /api/deudores
Content-Type: application/json

{
  "nombre":    "Juan García",
  "documento": "12345678A"
}
```

```json
// 201 Created
{
  "id":        "uuid-deudor",
  "nombre":    "Juan García",
  "documento": "12345678A",
  "deuda":     null
}
```

---

### 4.4 Generar deuda desde una operación

```http
POST /api/operaciones/a1b2c3d4/deuda?deudorId=uuid-deudor
```

```json
// 201 Created
{
  "id":                "uuid-deuda",
  "deudorId":          "uuid-deudor",
  "operacionId":       "a1b2c3d4",
  "montoPendiente":    920.00,
  "fechaVencimiento":  "2026-04-15",
  "estadoActual":      "VIGENTE"
}
```

---

### 4.5 Listar deudores con deuda activa embebida

```http
GET /api/deudores
```

```json
// 200 OK
[
  {
    "id":        "uuid-deudor",
    "nombre":    "Juan García",
    "documento": "12345678A",
    "deuda": {
      "id":               "uuid-deuda",
      "montoPendiente":   920.00,
      "fechaVencimiento": "2026-04-15",
      "estadoActual":     "VIGENTE",
      "deudorId":         "uuid-deudor"
    }
  },
  {
    "id":        "uuid-deudor-2",
    "nombre":    "María López",
    "documento": "87654321B",
    "deuda":     null
  }
]
```

---

### 4.6 Saldar deuda

```http
POST /api/deudores/uuid-deudor/saldar
```

```json
// 200 OK
{
  "id":        "uuid-deudor",
  "nombre":    "Juan García",
  "documento": "12345678A",
  "deuda": {
    "id":               "uuid-deuda",
    "montoPendiente":   920.00,
    "fechaVencimiento": "2026-04-15",
    "estadoActual":     "SALDADO",
    "deudorId":         "uuid-deudor"
  }
}
```

---

### 4.7 Extender fecha de vencimiento

```http
PUT /api/deudores/uuid-deudor/extender
Content-Type: application/json

{
  "nuevaFecha": "2026-05-01"
}
```

```json
// 200 OK
{
  "id":        "uuid-deudor",
  "nombre":    "Juan García",
  "documento": "12345678A",
  "deuda": {
    "id":               "uuid-deuda",
    "montoPendiente":   920.00,
    "fechaVencimiento": "2026-05-01",
    "estadoActual":     "VIGENTE",
    "deudorId":         "uuid-deudor"
  }
}
```

---

### 4.8 Guardar configuración (dispara historial automáticamente)

```http
PUT /api/configuracion
Content-Type: application/json

{
  "saldoEur":       24580,
  "saldoUsd":       18450,
  "saldoBrl":       3000,
  "saldoUsdt":      750,
  "carteraDefecto": "Trading Account",
  "monedaDefecto":  "EUR",
  "idioma":         "es"
}
```

```json
// 200 OK
{
  "saldoEur":       24580,
  "saldoUsd":       18450,
  "saldoBrl":       3000,
  "saldoUsdt":      750,
  "carteraDefecto": "Trading Account",
  "monedaDefecto":  "EUR",
  "idioma":         "es",
  "actualizadoEn":  "2026-03-15T15:00:00"
}
```

---

### 4.9 Consultar historial de configuración

```http
GET /api/configuracion/historial?page=0&size=10
```

```json
// 200 OK
{
  "content": [
    {
      "id":              5,
      "saldoEur":        24580,
      "saldoUsd":        18450,
      "saldoBrl":        3000,
      "saldoUsdt":       750,
      "carteraDefecto":  "Trading Account",
      "monedaDefecto":   "EUR",
      "idioma":          "es",
      "cambiadoEn":      "2026-03-15T15:00:00",
      "motivo":          null
    },
    {
      "id":              4,
      "saldoEur":        22000,
      "saldoUsd":        16000,
      "saldoBrl":        2500,
      "saldoUsdt":       500,
      "carteraDefecto":  "Savings Account",
      "monedaDefecto":   "USD",
      "idioma":          "es",
      "cambiadoEn":      "2026-03-10T09:30:00",
      "motivo":          null
    }
  ],
  "totalElements": 5,
  "totalPages":    1
}
```

---

## 5. Diagrama de relaciones entre tablas

```
configuracion (1 fila)
    │
    └── configuracion_historial (N)
            ← snapshot insertado ANTES de cada PUT /configuracion

deudores (N)
    │
    └── deudas (N)
            │   ← una deuda activa por deudor recomendable
            │
            └── operaciones (1, nullable)
                    ← la deuda puede nacer de una operación

operaciones (standalone)
    │
    └── deudas (N, via operacion_id)
            ← una operación puede generar deudas para distintos deudores
```

---

## 6. Convenciones de respuesta

### Listas paginadas

```json
{
  "content":       [...],
  "page":          0,
  "size":          7,
  "totalElements": 42,
  "totalPages":    6
}
```

### Errores

```json
{
  "status":    400,
  "error":     "Bad Request",
  "message":   "El campo 'nombre' es obligatorio",
  "timestamp": "2026-03-15T15:00:00"
}
```

### Códigos HTTP

| Situación         | Código |
|-------------------|--------|
| OK / actualizado  | 200    |
| Creado            | 201    |
| Sin contenido     | 204    |
| Datos inválidos   | 400    |
| No autenticado    | 401    |
| No encontrado     | 404    |
| Error interno     | 500    |

---

## 7. Checklist de adaptación del backend existente

### Operaciones
- [ ] Tabla `operaciones` con campos: `id`, `fecha_hora`, `tipo`, `activo_id`, `monto`, `precio_compra`, `precio_venta`
- [ ] Separar o mantener rutas `POST /compra` y `POST /venta` (el frontend ya enruta según `tipo`)
- [ ] Endpoint `POST /operaciones/:id/deuda?deudorId=` que inserta en tabla `deudas`
- [ ] `GET /operaciones` soporta query params: `currency`, `tipo`, `page`, `size`
- [ ] Respuesta usa nombres en camelCase: `fechaHora`, `activoId`, `monto`, `tasaCambio`

### Deudores
- [ ] Tabla `deudores`: `id`, `nombre`, `documento`
- [ ] Tabla `deudas`: `id`, `deudor_id`, `operacion_id`, `monto_pendiente`, `fecha_vencimiento`, `estado_actual`
- [ ] `GET /deudores` devuelve array con deuda activa embebida (LEFT JOIN a deudas donde estado IN ('VIGENTE','MORA'))
- [ ] `POST /deudores` recibe solo `nombre` y `documento`
- [ ] `POST /deudores/:id/saldar` → cambia `estado_actual` a `SALDADO`
- [ ] `PUT /deudores/:id/extender` → recibe `{ nuevaFecha }` y actualiza `fecha_vencimiento`
- [ ] Respuesta usa: `nombre`, `documento`, objeto `deuda` con `montoPendiente`, `fechaVencimiento`, `estadoActual`, `deudorId`
- [ ] Scheduler/job automático: pasar deudas de `VIGENTE` a `MORA` cuando `fecha_vencimiento < NOW()`

### Dashboard
- [ ] `GET /dashboard/stats` calcula y devuelve:
  - Saldos actuales desde tabla `configuracion`
  - Serie de 14 días de saldos por moneda
  - Tendencias mensuales (6 meses) de balance vs deudas
  - Últimas 6 operaciones

### Configuración
- [ ] Crear tabla `configuracion` con campos de saldos y preferencias (una sola fila)
- [ ] Crear tabla `configuracion_historial` como tabla intermedia de historial
- [ ] `PUT /configuracion`: insertar snapshot en historial ANTES de actualizar
- [ ] `GET /configuracion/historial` devuelve historial paginado ordenado por `cambiado_en DESC`

---

## 8. Notas importantes sobre el frontend

1. **Campo `importe` no se envía al crear deudor.** El formulario `AddDebtorModal` lo tiene
   visualmente pero el `mutate` solo incluye `{ nombre, documento }`. La deuda se vincula
   después via `POST /operaciones/:id/deuda?deudorId=`.

2. **Beneficio en tabla de operaciones.** El cálculo es `(sellPrice - buyPrice) * amount`.
   El adapter actual mapea `tasaCambio` a ambos precios, dando beneficio 0. Para que funcione,
   el backend debe devolver `precioCompra` y `precioVenta` por separado, o el frontend
   necesita ajustarse.

3. **La página Trade es solo visual.** BTC/USD, ETH/USD, órdenes abiertas, posiciones
   — todo es mock. No necesita backend en esta etapa.

4. **URL base del cliente axios:** `http://localhost:8080/api` en `src/api/client.ts`.
   Para producción, actualizar ese valor.

5. **Autenticación pendiente.** El cliente tiene interceptores JWT comentados.
   Cuando se implemente auth, el backend debe exponer `POST /api/auth/login`
   devolviendo `{ token: "..." }`.

6. **MORA automática.** Implementar un job/scheduler que diariamente consulte
   `deudas WHERE estado_actual = 'VIGENTE' AND fecha_vencimiento < NOW()`
   y los actualice a `MORA`.
