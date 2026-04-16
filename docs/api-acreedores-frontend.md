# API Acreedores — Referencia para el Frontend

Base URL: `/api/acreedores`

---

## Tipos compartidos

### AcreedorDTO (respuesta estándar)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Proveedor XYZ",
  "fechaVencimiento": "2025-06-30",
  "estado": "PENDIENTE",
  "saldos": [
    {
      "id": "7cb12a34-1234-4abc-a123-1c963f66afa6",
      "codigoDivisa": "USD",
      "monto": 1500.00,
      "fechaOperacion": "2025-04-15",
      "tipoOperacion": "COMPRA"
    }
  ]
}
```

| Campo | Tipo | Formato |
|---|---|---|
| `id` | UUID | string |
| `nombre` | String | string |
| `fechaVencimiento` | LocalDate | solo fecha: `"2025-06-30"`, puede ser `null` |
| `estado` | Enum | `PENDIENTE` \| `PAGADO` |
| `saldos` | array | puede ser `[]` |
| `saldos[].id` | UUID | string |
| `saldos[].codigoDivisa` | String | isoCode, ej: `"USD"`, `"ARS"`, `"BRL"` |
| `saldos[].monto` | Decimal | número |
| `saldos[].fechaOperacion` | LocalDate | solo fecha: `"2025-04-15"` |
| `saldos[].tipoOperacion` | Enum | `COMPRA` \| `VENTA` |

### AcreedorSugerenciaDTO (solo endpoint de búsqueda)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Proveedor XYZ"
}
```

---

## Endpoints

---

### 1. Listar todos los acreedores

```
GET /api/acreedores
```

**Request:** sin body, sin parámetros.

**Response 200:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Proveedor XYZ",
    "fechaVencimiento": "2025-06-30",
    "estado": "PENDIENTE",
    "saldos": []
  }
]
```

---

### 2. Listar acreedores pendientes

```
GET /api/acreedores/pendientes
```

**Request:** sin body, sin parámetros.

**Response 200:** igual a `AcreedorDTO[]`, pero solo incluye los acreedores con `estado = "PENDIENTE"`.

---

### 3. Buscar acreedores por nombre (sugerencias)

```
GET /api/acreedores/sugerencias?nombre={string}
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
    "nombre": "Proveedor XYZ"
  }
]
```

> **Nota:** retorna como máximo 10 resultados. La búsqueda es case-insensitive y por coincidencia parcial (contiene).

---

### 4. Obtener acreedor por ID

```
GET /api/acreedores/{id}
```

**Path param:**

| Nombre | Tipo |
|---|---|
| `id` | UUID |

**Response 200:** `AcreedorDTO` (ver tipo compartido arriba).

---

### 5. Crear acreedor

```
POST /api/acreedores
Content-Type: application/json
```

**Request body:**
```json
{
  "nombre": "Proveedor XYZ",
  "fechaVencimiento": "2025-06-30",
  "saldos": [
    {
      "codigoDivisa": "USD",
      "monto": 1500.00,
      "tipoOperacion": "COMPRA"
    }
  ]
}
```

| Campo | Tipo | Formato | Requerido |
|---|---|---|---|
| `nombre` | String | string | Sí |
| `fechaVencimiento` | LocalDate | solo fecha: `"2025-06-30"` | No |
| `saldos` | array | mínimo 1 elemento | Sí |
| `saldos[].codigoDivisa` | String | isoCode, ej: `"USD"` | Sí |
| `saldos[].monto` | Decimal | número, debe ser > 0 | Sí |
| `saldos[].tipoOperacion` | Enum | `COMPRA` \| `VENTA` | Sí |

**Response 201:** `AcreedorDTO` con `estado = "PENDIENTE"`.

> **Nota:** si la divisa indicada en `codigoDivisa` no existe en el sistema, se crea automáticamente.

---

### 6. Registrar pagos

```
PUT /api/acreedores/pagar
Content-Type: application/json
```

**Request body:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pagos": [
    {
      "codigoDivisa": "USD",
      "monto": 500.00
    }
  ]
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| `id` | UUID | Sí |
| `pagos` | array | Sí |
| `pagos[].codigoDivisa` | String | Sí |
| `pagos[].monto` | Decimal | Sí |

**Response 200:** `AcreedorDTO` actualizado.

> **Notas:**
> - El `monto` de cada pago no puede superar el saldo disponible en esa divisa.
> - Cuando todos los saldos llegan a `0`, el `estado` cambia automáticamente a `"PAGADO"`.

---

### 7. Eliminar acreedor

```
DELETE /api/acreedores/{id}
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
| GET | `/api/acreedores` | — | 200 `AcreedorDTO[]` |
| GET | `/api/acreedores/pendientes` | — | 200 `AcreedorDTO[]` |
| GET | `/api/acreedores/sugerencias?nombre=` | — | 200 `{ id, nombre }[]` |
| GET | `/api/acreedores/{id}` | — | 200 `AcreedorDTO` |
| POST | `/api/acreedores` | `CrearAcreedorRequest` | 201 `AcreedorDTO` |
| PUT | `/api/acreedores/pagar` | `PagarAcreedorRequest` | 200 `AcreedorDTO` |
| DELETE | `/api/acreedores/{id}` | — | 204 |
