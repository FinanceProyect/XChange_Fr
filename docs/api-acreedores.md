# API — Acreedores

Base URL: `/api/acreedores`

---

## GET /api/acreedores
Devuelve todos los acreedores.

**Request:** sin body

**Response `200`**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Juan Perez",
    "saldos": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "nombreDivisa": "USD",
        "monto": 500.00,
        "fechaOperacion": "2024-06-01T10:00:00Z",
        "tipoOperacion": "COMPRA",
        "estado": "PENDIENTE"
      }
    ]
  }
]
```

---

## GET /api/acreedores/pendientes
Devuelve los acreedores que tienen al menos un saldo en estado `PENDIENTE`.

**Request:** sin body

**Response `200`** — mismo formato que `GET /api/acreedores`

---

## GET /api/acreedores/sugerencias?nombre={nombre}
Busca acreedores por nombre (hasta 10 resultados). Útil para autocomplete.

**Query param:** `nombre` — texto a buscar

**Response `200`**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Juan Perez"
  }
]
```

---

## GET /api/acreedores/{id}
Devuelve un acreedor por su ID.

**Path param:** `id` — UUID del acreedor

**Response `200`**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Juan Perez",
  "saldos": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "nombreDivisa": "USD",
      "monto": 500.00,
      "fechaOperacion": "2024-06-01T10:00:00Z",
      "tipoOperacion": "COMPRA",
      "estado": "PENDIENTE"
    }
  ]
}
```

---

## POST /api/acreedores
Crea un nuevo acreedor y registra su saldo inicial en una divisa.

> La divisa debe existir previamente en la base de datos. Se busca por `nombreDivisa`.

**Request body**
```json
{
  "nombre": "Juan Perez",
  "nombreDivisa": "USD",
  "monto": 500.00,
  "fechaOperacion": "2024-06-01T10:00:00Z",
  "tipoOperacion": "COMPRA"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | `string` | Nombre del acreedor |
| `nombreDivisa` | `string` | Nombre de la divisa (debe existir en la BD) |
| `monto` | `number` | Monto del saldo inicial |
| `fechaOperacion` | `string (ISO 8601)` | Fecha y hora de la operación |
| `tipoOperacion` | `"COMPRA"` \| `"VENTA"` | Tipo de operación |

**Response `201`**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Juan Perez",
  "saldos": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "nombreDivisa": "USD",
      "monto": 500.00,
      "fechaOperacion": "2024-06-01T10:00:00Z",
      "tipoOperacion": "COMPRA",
      "estado": "PENDIENTE"
    }
  ]
}
```

---

## PUT /api/acreedores/pagar
Registra un pago a un acreedor. Si el monto de un saldo llega a 0, ese saldo pasa a `PAGADO`.

**Request body**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pagos": [
    {
      "codigoDivisa": "USD",
      "monto": 200.00
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string (UUID)` | ID del acreedor |
| `pagos` | `array` | Lista de pagos por divisa |
| `pagos[].codigoDivisa` | `string` | Nombre de la divisa a pagar |
| `pagos[].monto` | `number` | Monto a abonar (no puede exceder el saldo) |

**Response `200`** — acreedor actualizado con los nuevos saldos

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Juan Perez",
  "saldos": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "nombreDivisa": "USD",
      "monto": 300.00,
      "fechaOperacion": "2024-06-01T10:00:00Z",
      "tipoOperacion": "COMPRA",
      "estado": "PENDIENTE"
    }
  ]
}
```

---

## DELETE /api/acreedores/{id}
Elimina un acreedor por su ID.

**Path param:** `id` — UUID del acreedor

**Response `204`** — sin body
