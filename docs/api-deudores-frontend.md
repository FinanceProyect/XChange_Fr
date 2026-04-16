# API Deudores — Referencia para el Frontend

Base URL: `/api/deudores`

---

## Tipos compartidos

### DeudorDTO (respuesta estándar)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Juan Pérez",
  "fecha": "2025-04-15T10:30:00-03:00",
  "deudas": [
    {
      "id": "abc123",
      "moneda": "USD",
      "montoPendiente": 1500.00,
      "estado": "VIGENTE",
      "fechaVencimiento": "2025-06-30"
    }
  ]
}
```

| Campo | Tipo | Formato |
|---|---|---|
| `id` | UUID | string |
| `nombre` | String | string |
| `fecha` | OffsetDateTime | ISO 8601 con offset: `"2025-04-15T10:30:00-03:00"` |
| `deudas` | array | puede ser `[]` |
| `deudas[].id` | String | string |
| `deudas[].moneda` | String | isoCode, ej: `"USD"`, `"ARS"` |
| `deudas[].montoPendiente` | Decimal | número |
| `deudas[].estado` | Enum | `VIGENTE` \| `MORA` \| `SALDADO` \| `CERRADO` |
| `deudas[].fechaVencimiento` | LocalDate | solo fecha: `"2025-06-30"` |

---

## Endpoints

---

### 1. Listar todos los deudores

```
GET /api/deudores
```

**Request:** sin body, sin parámetros.

**Response 200:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Juan Pérez",
    "fecha": "2025-04-15T10:30:00-03:00",
    "deudas": []
  }
]
```

---

### 2. Buscar deudores por nombre (sugerencias)

```
GET /api/deudores/sugerencias?nombre={string}
```

**Query param:**

| Nombre | Tipo | Requerido |
|---|---|---|
| `nombre` | String | Sí |

**Response 200:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Juan Pérez"
  }
]
```

---

### 3. Obtener deudor por ID

```
GET /api/deudores/{id}
```

**Path param:**

| Nombre | Tipo |
|---|---|
| `id` | UUID |

**Response 200:** `DeudorDTO` (ver tipo compartido arriba).

---

### 4. Crear deudor

```
POST /api/deudores
Content-Type: application/json
```

**Request body:**
```json
{
  "nombre": "Juan Pérez",
  "fecha": "2025-04-15T10:30:00-03:00",
  "deudas": [
    {
      "moneda": "USD",
      "monto": 1500.00,
      "fechaVencimiento": "2025-06-30"
    }
  ]
}
```

| Campo | Tipo | Formato | Requerido |
|---|---|---|---|
| `nombre` | String | string | Sí |
| `fecha` | OffsetDateTime | ISO 8601 con offset | Sí |
| `deudas` | array | puede ser `[]` | Sí |
| `deudas[].moneda` | String | isoCode, ej: `"USD"` | Sí |
| `deudas[].monto` | Decimal | número | Sí |
| `deudas[].fechaVencimiento` | LocalDate | solo fecha: `"2025-06-30"` | Sí |

**Response 201:** `DeudorDTO` (ver tipo compartido arriba).

> **Nota sobre `fecha`:** debe incluir el offset de zona horaria (ej: `-03:00`). No usar solo `"2025-04-15T10:30:00"` sin offset.

---

### 5. Registrar pagos

```
PUT /api/deudores/pagar
Content-Type: application/json
```

**Request body:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pagos": [
    {
      "moneda": "USD",
      "monto": 500.00
    }
  ]
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `id` | UUID | Sí |
| `pagos` | array | Sí |
| `pagos[].moneda` | String | Sí |
| `pagos[].monto` | Decimal | Sí |

**Response 200:** `DeudorDTO` actualizado.

---

### 6. Eliminar deudor

```
DELETE /api/deudores/{id}
```

**Path param:**

| Nombre | Tipo |
|---|---|
| `id` | UUID |

**Response 204:** sin body.

---

## Resumen de endpoints

| Método | URL | Body | Response |
|---|---|---|---|
| GET | `/api/deudores` | — | 200 `DeudorDTO[]` |
| GET | `/api/deudores/sugerencias?nombre=` | — | 200 `{ id, nombre }[]` |
| GET | `/api/deudores/{id}` | — | 200 `DeudorDTO` |
| POST | `/api/deudores` | `CargarDeudorRequest` | 201 `DeudorDTO` |
| PUT | `/api/deudores/pagar` | `ActualizarDeudorRequest` | 200 `DeudorDTO` |
| DELETE | `/api/deudores/{id}` | — | 204 |
