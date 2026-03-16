# CambioJoyas — Backend API

Backend para la gestión de operaciones de compra/venta de divisas, metales preciosos y criptoactivos.

## Stack

- Java 17 + Spring Boot 4
- MySQL 8
- Puerto: `8080`

## Levantar el proyecto

```bash
./mvnw spring-boot:run
```

Asegurarse de que MySQL esté corriendo con la base de datos `cambio_joyas_db` accesible.

---

## Estado actual

| Capa | Estado |
|---|---|
| Modelos + JPA | Completo |
| Servicios (lógica de negocio) | Completo |
| REST Controllers | Completo |
| Tests unitarios (56) | Pasando |
| Tests de integración con Testcontainers (11) | Pasando |
| Seguridad | Abierta (sin auth) |
| CORS | Habilitado para `http://localhost:5173` |

---

## Verificar que el backend está activo

```
GET http://localhost:8080/api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "app": "CambioJoyas"
}
```

---

## API Reference

### Base URL
```
http://localhost:8080/api
```

---

## Deudores

### Crear deudor

```
POST /api/deudores
```

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "documento": "12345678A"
}
```

**Respuesta `201 Created`:**
```json
{
  "id": "a1b2c3d4-...",
  "nombre": "Juan Pérez",
  "documento": "12345678A"
}
```

> Al crear un deudor se inicializa automáticamente su cartera vacía.

---

### Saldar deuda de un deudor

```
POST /api/deudores/{id}/saldar
```

No requiere body. Acredita el pago total de la deuda activa del deudor.

**Respuesta `200 OK`** (sin body)

---

### Extender fecha de vencimiento de deuda

```
PUT /api/deudores/{id}/extender
```

**Body:**
```json
{
  "nuevaFecha": "2026-06-30"
}
```

**Respuesta `200 OK`** (sin body)

> Si la deuda estaba en MORA, vuelve automáticamente a VIGENTE.

---

## Cartera

### Consultar cartera de un deudor

```
GET /api/carteras/{deudorId}
```

**Respuesta `200 OK`:**
```json
{
  "id": "c1d2e3f4-...",
  "deudorId": "a1b2c3d4-...",
  "saldos": {
    "USD": 500.0000,
    "ORO": 7.5000,
    "BTC": 150000
  }
}
```

> Las claves del mapa `saldos` son: isoCode para fiat (`"USD"`, `"EUR"`), nombre para metales (`"ORO"`, `"PLATA"`), símbolo para cripto (`"BTC"`, `"USDT"`).

---

### Configurar saldo inicial — Divisa Fiat

```
POST /api/carteras/{deudorId}/saldo-inicial/fiat
```

**Body:**
```json
{
  "isoCode": "USD",
  "monto": 500,
  "cotizacionAdquisicion": 3.75
}
```

> `cotizacionAdquisicion` es opcional. Se usa para calcular beneficios en reportes futuros.

**Respuesta `201 Created`** (sin body)

---

### Configurar saldo inicial — Metal Precioso

```
POST /api/carteras/{deudorId}/saldo-inicial/metal
```

**Body:**
```json
{
  "metalType": "ORO",
  "grossWeight": 10,
  "quilataje": 18,
  "cotizacionAdquisicion": 60
}
```

> `metalType` acepta: `"ORO"` o `"PLATA"`.
> `quilataje` debe estar entre 1 y 24.
> El sistema calcula automáticamente `pureza = quilataje / 24` y `pesoFino = grossWeight * pureza`. El saldo registrado en cartera es el `pesoFino`.
> `cotizacionAdquisicion` es opcional.

**Respuesta `201 Created`** (sin body)

---

### Configurar saldo inicial — Criptoactivo

```
POST /api/carteras/{deudorId}/saldo-inicial/cripto
```

**Body:**
```json
{
  "simbolo": "BTC",
  "cantidadSatoshis": 150000,
  "cotizacionAdquisicion": 95000
}
```

> `cotizacionAdquisicion` es opcional.

**Respuesta `201 Created`** (sin body)

---

### Ajustar inventario (corrección posterior)

```
PUT /api/carteras/{deudorId}/ajuste
```

**Body:**
```json
{
  "tipoActivo": "FIAT",
  "identificador": "EUR",
  "monto": 200,
  "motivo": "Aporte de capital"
}
```

> `tipoActivo` acepta: `"FIAT"`, `"METAL"`, `"CRIPTO"`.
> `motivo` es **obligatorio** en ajustes posteriores.
> `monto` puede ser negativo para reducir saldo.

**Respuesta `200 OK`** (sin body)

---

### Consultar historial de la cartera

```
GET /api/carteras/{deudorId}/historial
```

**Respuesta `200 OK`:**
```json
[
  {
    "id": "h1i2j3k4-...",
    "carteraId": "c1d2e3f4-...",
    "fechaHora": "2026-03-15T10:30:00",
    "descripcion": "Saldo inicial FIAT USD",
    "saldosAntes": "{\"EUR\": 1000.0000}",
    "saldosDespues": "{\"EUR\": 1000.0000, \"USD\": 500.0000}"
  }
]
```

> `saldosAntes` y `saldosDespues` son strings JSON con el snapshot de saldos antes y después de cada cambio.

---

### Consultar movimientos de inventario

```
GET /api/carteras/{deudorId}/movimientos
```

**Respuesta `200 OK`:**
```json
[
  {
    "id": "m1n2o3p4-...",
    "carteraId": "c1d2e3f4-...",
    "fechaHora": "2026-03-15T10:30:00",
    "tipoActivo": "FIAT",
    "identificador": "USD",
    "monto": 500.0000,
    "cotizacionAdquisicion": 3.75,
    "esApertura": true,
    "motivo": null
  }
]
```

> `esApertura: true` indica que es el saldo inicial. Los ajustes posteriores tienen `esApertura: false` y siempre tienen `motivo`.

---

## Operaciones

### Registrar compra

```
POST /api/operaciones/compra
```

**Body:**
```json
{
  "deudorId": "a1b2c3d4-...",
  "activoId": "e5f6g7h8-...",
  "monto": 500,
  "tasaCambio": 3.75
}
```

> `activoId` es el ID de un activo ya registrado en la base de datos.

**Respuesta `201 Created`:**
```json
{
  "id": "op1-...",
  "fechaHora": "2026-03-15T11:00:00",
  "tipo": "COMPRA",
  "activoId": "e5f6g7h8-...",
  "monto": 500,
  "tasaCambio": 3.75
}
```

---

### Registrar venta

```
POST /api/operaciones/venta
```

**Body:**
```json
{
  "deudorId": "a1b2c3d4-...",
  "activoId": "e5f6g7h8-...",
  "monto": 300,
  "tasaCambio": 3.80
}
```

**Respuesta `201 Created`:**
```json
{
  "id": "op2-...",
  "fechaHora": "2026-03-15T11:05:00",
  "tipo": "VENTA",
  "activoId": "e5f6g7h8-...",
  "monto": 300,
  "tasaCambio": 3.80
}
```

---

### Generar deuda desde operación

```
POST /api/operaciones/{id}/deuda?deudorId={deudorId}
```

> `id` es el ID de la operación. `deudorId` va como query param.

**Ejemplo:**
```
POST /api/operaciones/op1-.../deuda?deudorId=a1b2c3d4-...
```

**Respuesta `201 Created`:**
```json
{
  "id": "d1e2f3-...",
  "montoPendiente": 1875.0000,
  "fechaVencimiento": "2026-04-14",
  "estadoActual": "VIGENTE",
  "deudorId": "a1b2c3d4-..."
}
```

> `montoPendiente = monto × tasaCambio`. La fecha de vencimiento se fija a 30 días desde la creación.

---

## Valores posibles de enums

| Campo | Valores |
|---|---|
| `estadoActual` (Deuda) | `"VIGENTE"`, `"MORA"`, `"SALDADO"`, `"CERRADO"` |
| `tipo` (Operacion) | `"COMPRA"`, `"VENTA"` |
| `metalType` | `"ORO"`, `"PLATA"` |
| `tipoActivo` (ajuste) | `"FIAT"`, `"METAL"`, `"CRIPTO"` |

---

## Flujo típico de uso

```
1. POST /api/deudores              → crear deudor (se crea cartera vacía)
2. POST /api/carteras/{id}/saldo-inicial/fiat  → cargar saldo inicial
3. POST /api/operaciones/compra    → registrar compra
4. POST /api/operaciones/{id}/deuda → generar deuda desde la operación
5. POST /api/deudores/{id}/saldar  → cuando el deudor paga
```

---

## Ejecutar tests

```bash
# Solo unitarios (sin Docker)
./mvnw test

# Unitarios + integración (requiere Docker)
./mvnw test "-Dexcluded.test.groups="
```
