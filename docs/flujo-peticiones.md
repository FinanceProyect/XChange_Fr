# Flujo de peticiones — Frontend al Backend

## Visión general

El frontend usa una arquitectura en cuatro capas para comunicarse con el backend. Cada capa tiene una responsabilidad exclusiva:

```
Componente / Página
       ↓
  Query Hook  (TanStack Query)
       ↓
   Service    (llamada HTTP)
       ↓
  API Client  (axios)
       ↓
   Backend    http://localhost:8080/api
```

Cuando el backend devuelve datos, existe una capa adicional de transformación antes de que lleguen al componente:

```
Backend → API Client → Service → Adapter → Query Hook → Componente
```

---

## Capa 1 — API Client (`src/api/client.ts`)

Es la única instancia de axios en todo el proyecto. Todos los servicios la importan.

```
baseURL : http://localhost:8080/api
timeout : 10 000 ms
headers : Content-Type: application/json
```

### Interceptor de respuesta (error global)

Cuando cualquier petición falla (código HTTP 4xx / 5xx o error de red), el interceptor captura el error, extrae el mensaje y lanza un toast de error visible al usuario — sin que ningún componente tenga que manejar ese caso individualmente.

```
error.response?.data?.message  →  showToast({ variant: "error" })
error.message                   →  showToast({ variant: "error" })
```

> **Pendiente:** hay un interceptor de request comentado para adjuntar el token de autorización (`Bearer <token>`). Cuando el backend tenga autenticación, se descomenta y se conecta al almacenamiento del token.

---

## Capa 2 — Services (`src/services/`)

Son funciones `async` puras — sin React, sin estado, sin tipos de dominio. Solo hacen la llamada HTTP y devuelven `response.data` como `unknown`.

Devolver `unknown` es una decisión intencional: el contrato del backend todavía no está finalizado, por lo que no se asumen nombres de campos ni estructuras.

### Endpoints disponibles

| Servicio | Método | Endpoint |
|---|---|---|
| `getStats()` | GET | `/dashboard/stats` |
| `getCurrencyBalances()` | GET | `/balance` |
| `getBalanceSnapshots(fecha)` | GET | `/balance/stats?fecha=YYYY-MM-DD` |
| `getAll()` — operaciones | GET | `/operaciones` |
| `getById(id)` — operaciones | GET | `/operaciones/:id` |
| `create(data)` — operaciones | POST | `/operaciones/compra` o `/operaciones/venta` |
| `update(id, data)` — operaciones | PUT | `/operaciones/:id` |
| `remove(id)` — operaciones | DELETE | `/operaciones/:id` |
| `generarDeuda(opId, deudorId)` | POST | `/operaciones/:id/deuda?deudorId=` |
| `getAll()` — deudores | GET | `/deudores` |
| `getById(id)` — deudores | GET | `/deudores/:id` |
| `create(data)` — deudores | POST | `/deudores` |
| `update(id, data)` — deudores | PUT | `/deudores/:id` |
| `pagar(data)` — deudores | PUT | `/deudores/pagar` |
| `remove(id)` — deudores | DELETE | `/deudores/:id` |
| `extenderFecha(id, fecha)` — deudores | PUT | `/deudores/:id/extender` |
| `getConfiguracion()` | GET | `/configuracion` |
| `saveConfiguracion(data)` | PUT | `/configuracion` |

### Caso especial — create operación

El endpoint de creación varía según el tipo de la operación. El service inspecciona el campo `tipo` del payload antes de hacer el POST:

```
payload.tipo === 'COMPRA'  →  POST /operaciones/compra
payload.tipo === 'VENTA'   →  POST /operaciones/venta
```

---

## Capa 3 — Adapters (`src/adapters/`)

Los adapters transforman la respuesta cruda del backend (`unknown`) al tipo que espera el frontend. Esta capa aísla al resto del código de los cambios en el contrato del backend.

### `balance.adapter.ts`

Convierte la lista de saldos del backend al formato que usan las cards del dashboard.

**Backend envía:**
```json
[
  { "activo": "USD", "saldo": 12000 },
  { "activo": "EUR", "saldo": 8500 }
]
```

**Frontend recibe:**
```ts
[
  { currency: "USD", symbol: "$",  amount: 12000 },
  { currency: "EUR", symbol: "€",  amount: 8500  }
]
```

El adapter también valida el payload con un type guard (`isBackendBalance`) antes de transformar — si un item no tiene la forma esperada, se filtra silenciosamente.

El mapeo de símbolos está definido localmente:
```
EUR → "€"   |   USD → "$"   |   BRL → "R$"   |   USDT → "₮"
```

### `balanceSnapshot.adapter.ts`

Convierte la lista de snapshots horarios del backend en puntos de datos para el gráfico de portfolio.

**Backend envía:**
```json
[
  { "balanceTotal": 45000, "EUR": 8000, "USD": 12000, "BRL": 5000, "USDT": 20000, "fecha": "2026-03-25T10:00:00" }
]
```

**Frontend recibe:**
```ts
[
  { timestamp: "2026-03-25T10:00:00", hourLabel: "10:00", total: 45000, EUR: 8000, USD: 12000, BRL: 5000, USDT: 20000 }
]
```

El adapter acepta tanto `euro` como `EUR` (y `usd`/`USD`) para tolerar inconsistencias en el naming del backend. Los items con campos nulos o inválidos se descartan. El resultado se ordena cronológicamente por `timestamp`.

### `deudores.adapter.ts`

Convierte un deudor del backend al tipo `Debtor` del frontend.

**Backend envía:**
```json
{ "id": "1", "nombre": "Juan García", "documento": "12345678", "fecha": "2026-03-01", "importe": 5000, "estado": "pendiente" }
```

**Frontend recibe:**
```ts
{ id: "1", name: "Juan García", avatar: "JG", document: "12345678", date: "2026-03-01", amount: "5000", status: "Pending" }
```

Normalización de estados (acepta español e inglés):
```
"paid" / "pagado"       →  "Paid"
"pending" / "pendiente" →  "Pending"
"overdue" / "vencido"   →  "Overdue"
```

El avatar se genera automáticamente con las iniciales del nombre.

### `operaciones.adapter.ts`

Convierte una operación del backend al tipo `Operation` del frontend.

**Backend envía:**
```json
{ "id": "1", "fechaHora": "2026-03-25T14:30:00", "tipo": "COMPRA", "activoId": "USD", "monto": 1000, "tasaCambio": 1.08 }
```

**Frontend recibe:**
```ts
{ id: "1", date: "2026-03-25", dateTime: "2026-03-25T14:30:00", currency: "USD", type: "Compra", amount: 1000, buyPrice: 1.08, sellPrice: 1.08 }
```

---

## Capa 4 — Query Hooks (`src/queries/`)

Son hooks de React que usan TanStack Query. Gestionan el ciclo de vida completo: loading, error, caché, revalidación e invalidación.

### Queries (lectura)

Cada query tiene una `queryKey` única que identifica los datos en caché:

| Hook | queryKey | Qué hace |
|---|---|---|
| `useDashboardStats()` | `["dashboard", "stats"]` | Stats generales del dashboard |
| `useDashboardCurrencyBalances()` | `["dashboard", "balances"]` | Saldos de divisas, pasa por `balance.adapter` |
| `useBalanceSnapshots()` | `["dashboard", "balance-snapshots", fecha]` | Snapshots horarios del día actual, pasa por `balanceSnapshot.adapter` |
| `useOperaciones(params?)` | `["operaciones", params]` | Lista de operaciones, con filtros opcionales |
| `useDeudores(params?)` | `["deudores", params]` | Lista de deudores |
| `useConfiguracion()` | `["configuracion"]` | Configuración guardada |

### Mutations (escritura)

Cuando una mutation tiene éxito, invalida automáticamente las queries relacionadas para que los datos se refresquen:

| Hook | Invalida |
|---|---|
| `useCreateDeudor` | `["deudores"]` |
| `useUpdateDeudor` | `["deudores"]` |
| `usePagarDeudor` | `["deudores"]` |
| `useDeleteDeudor` | `["deudores"]` |
| `useExtenderFecha` | `["deudores"]` |
| `useCreateOperacion` | `["operaciones"]` + `["dashboard", "stats"]` + `["dashboard", "balances"]` |
| `useUpdateOperacion` | `["operaciones"]` + dashboard |
| `useDeleteOperacion` | `["operaciones"]` + dashboard |
| `useSaveConfiguracion` | `["configuracion"]` + `["dashboard", "stats"]` |

### Optimistic update — `useCreateOperacion`

Al crear una operación, además de invalidar el caché, el hook aplica una actualización optimista sobre `["dashboard", "stats"]`: suma o resta el monto al saldo de la divisa correspondiente en caché antes de que el servidor responda, para que el dashboard refleje el cambio inmediatamente.

```
tipo VENTA  →  saldo - monto
tipo COMPRA →  saldo + monto  (mínimo 0)
```

### Refresh automático de snapshots — `useBalanceSnapshots`

El gráfico de portfolio no usa `refetchInterval` fijo. En su lugar, el hook calcula cuánto tiempo falta para el próximo minuto `:02` de la hora y programa el primer refresh con `setTimeout`. A partir de ese momento repite cada hora con `setInterval`. El cleanup del `useEffect` cancela ambos timers al desmontar.

```
Ejemplo: son las 14:45:30
→ próximo refresh: 15:02:00
→ delay: 16 min 30 seg
→ luego: cada 60 min
```

---

## Sistema de notificaciones — Toast Bus (`src/lib/toastBus.ts`)

Es un event bus simple basado en un `Set` de listeners. No usa React context ni estado global.

```
showToast({ message, variant })
    ↓
notifica a todos los listeners registrados
    ↓
GlobalToastHost (montado en App) muestra el toast
```

El interceptor de axios usa `showToast` directamente — por eso los errores HTTP se muestran automáticamente en cualquier parte de la app sin que los componentes lo manejen.

---

## Flujo completo — ejemplo: abrir la página Dashboard

```
1. Dashboard.tsx se monta
2. Llama a useDashboardCurrencyBalances() y useDashboardStats()
3. TanStack Query verifica si hay datos en caché para esas queryKeys
   → Si hay caché válido: devuelve los datos inmediatamente
   → Si no hay caché: ejecuta la queryFn
4. queryFn llama a getCurrencyBalances() (service)
5. getCurrencyBalances() hace GET http://localhost:8080/api/balance via apiClient
6. axios envía la request con Content-Type: application/json
7. El backend responde con [ { activo, saldo }, ... ]
8. El interceptor de respuesta deja pasar la respuesta sin modificarla
9. El service devuelve response.data (unknown)
10. La queryFn pasa el resultado por balancesResponseToCards() (adapter)
11. El adapter valida, transforma y devuelve CurrencyBalanceCard[]
12. TanStack Query almacena el resultado en caché con key ["dashboard", "balances"]
13. El hook devuelve { data: CurrencyBalanceCard[] } al componente
14. Dashboard.tsx renderiza las cards con los datos transformados
```

## Flujo completo — ejemplo: crear una operación

```
1. El usuario completa el formulario en AddOperationModal y confirma
2. El componente llama a useCreateOperacion().mutate(payload)
3. TanStack Query ejecuta la mutationFn: create(payload)
4. El service inspecciona payload.tipo:
   → "COMPRA" → POST /operaciones/compra
   → "VENTA"  → POST /operaciones/venta
5. axios envía el POST con el payload como JSON
6. El backend procesa y responde con la operación creada
7. onSuccess se ejecuta:
   a. updateDashboardBalancesCache → ajusta el saldo en caché optimistamente
   b. invalidateQueries(["operaciones"]) → refetch de la tabla de operaciones
   c. invalidateQueries(["dashboard", "stats"]) → refetch de stats
   d. invalidateQueries(["dashboard", "balances"]) → refetch de saldos
8. Los componentes suscritos a esas queryKeys se re-renderizan con datos frescos
```

---

## Estado actual de integración

Los hooks y servicios están completamente implementados. Sin embargo, los **componentes todavía leen de `mockData.ts`** directamente en la mayoría de los casos. La integración real requiere:

1. Levantar el backend en `http://localhost:8080/api`
2. Reemplazar en cada componente la lectura de `mockData` por el hook correspondiente
3. Descomentar el interceptor de autenticación en `api/client.ts` cuando el backend lo requiera

Solo hay que modificar los endpoints en los services si el backend usa rutas distintas.
