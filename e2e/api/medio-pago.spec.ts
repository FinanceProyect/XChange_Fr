import { test, expect, type APIRequestContext } from '@playwright/test'
import { getToken } from '../support/api'
import { getSaldo, setSaldo, sql } from '../support/db'

// Medio de pago en pesos para compras y ventas de divisas (change medio-pago-operaciones).
//   ARS    = caja ARS (pesos en efectivo)
//   PTRANS = saldo de pesos transferencia (pesos en el circuito bancario)
// Contra el backend real en :8080. Cubre la tarea 7.3 (flujo venta/editar/eliminar) y el
// comportamiento de operaciones previas a la migración V6 (7.4: quedan en ARS).

const BASE = 'http://localhost:8080/api'

async function headers(request: APIRequestContext) {
  return { Authorization: `Bearer ${await getToken(request)}` }
}

function resetMedioPago() {
  sql('DELETE FROM deudas')
  sql('DELETE FROM operaciones')
  for (const a of ['USD', 'EUR', 'BRL', 'USDT']) setSaldo(a, 100000)
  setSaldo('ARS', 1000000)
  setSaldo('PTRANS', 0)
}

function contarOperaciones(): number {
  return Number(sql('SELECT COUNT(*) FROM operaciones'))
}

test.beforeEach(() => {
  resetMedioPago()
})

test.describe('7.3 flujo de venta y compra con pesos transferencia', () => {
  test('venta USD con PTRANS: sube PTRANS por monto × tasa, USD baja y la caja ARS no cambia', async ({ request }) => {
    const res = await request.post(`${BASE}/operaciones/venta`, {
      headers: await headers(request),
      data: { activoId: 'USD', monto: 100, tasaCambio: 1000, medioPago: 'PTRANS' },
    })
    expect(res.status()).toBe(201)
    expect((await res.json()).medioPago).toBe('PTRANS')

    expect(getSaldo('USD')).toBe(99900)
    expect(getSaldo('PTRANS')).toBe(100000)
    expect(getSaldo('ARS')).toBe(1000000)
  })

  test('editar la venta con PTRANS revierte sobre PTRANS y aplica el nuevo monto, medio sin cambios', async ({ request }) => {
    const alta = await request.post(`${BASE}/operaciones/venta`, {
      headers: await headers(request),
      data: { activoId: 'USD', monto: 100, tasaCambio: 1000, medioPago: 'PTRANS' },
    })
    const id = (await alta.json()).id

    const res = await request.put(`${BASE}/operaciones/${id}`, {
      headers: await headers(request),
      data: { monto: 150 },
    })
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).medioPago).toBe('PTRANS')

    expect(getSaldo('PTRANS')).toBe(150000)
    expect(getSaldo('USD')).toBe(99850)
    expect(getSaldo('ARS')).toBe(1000000)
  })

  test('eliminar la venta con PTRANS revierte PTRANS y USD, la caja ARS no cambia', async ({ request }) => {
    const alta = await request.post(`${BASE}/operaciones/venta`, {
      headers: await headers(request),
      data: { activoId: 'USD', monto: 100, tasaCambio: 1000, medioPago: 'PTRANS' },
    })
    const id = (await alta.json()).id

    const res = await request.delete(`${BASE}/operaciones/${id}`, { headers: await headers(request) })
    expect(res.ok()).toBeTruthy()

    expect(getSaldo('PTRANS')).toBe(0)
    expect(getSaldo('USD')).toBe(100000)
    expect(getSaldo('ARS')).toBe(1000000)
    expect(contarOperaciones()).toBe(0)
  })

  test('compra con PTRANS sin saldo: 409 con "Saldo insuficiente en PTRANS", no persiste ni mueve saldos', async ({ request }) => {
    const res = await request.post(`${BASE}/operaciones/compra`, {
      headers: await headers(request),
      data: { activoId: 'USD', monto: 100, tasaCambio: 1500, medioPago: 'PTRANS' },
    })
    expect(res.status()).toBe(409)
    expect((await res.json()).error).toBe('Saldo insuficiente en PTRANS')

    expect(contarOperaciones()).toBe(0)
    expect(getSaldo('USD')).toBe(100000)
    expect(getSaldo('PTRANS')).toBe(0)
    expect(getSaldo('ARS')).toBe(1000000)
  })

  test('compra con PTRANS y saldo suficiente: baja PTRANS por monto × tasa (150.000) y la caja no cambia', async ({ request }) => {
    setSaldo('PTRANS', 200000)

    const res = await request.post(`${BASE}/operaciones/compra`, {
      headers: await headers(request),
      data: { activoId: 'USD', monto: 100, tasaCambio: 1500, medioPago: 'PTRANS' },
    })
    expect(res.status()).toBe(201)

    expect(getSaldo('PTRANS')).toBe(50000)
    expect(getSaldo('USD')).toBe(100100)
    expect(getSaldo('ARS')).toBe(1000000)
  })

  test('medio PTRANS con metal es rechazado (400) sin tocar saldos', async ({ request }) => {
    const res = await request.post(`${BASE}/operaciones/venta`, {
      headers: await headers(request),
      data: { activoId: 'ORO', quilataje: 18, peso: 10, tasaCambio: 100000, medioPago: 'PTRANS' },
    })
    expect(res.status()).toBe(400)
    expect(contarOperaciones()).toBe(0)
    expect(getSaldo('PTRANS')).toBe(0)
  })
})

test.describe('7.4 operaciones previas a la migración V6 quedan en ARS', () => {
  test('operación sin medio_pago en la base se devuelve como ARS', async ({ request }) => {
    // Simula una fila previa a V6: el INSERT no informa medio_pago, así que toma el default ARS.
    sql(`INSERT INTO operaciones (id, activo_id, fecha_hora, monto, monto_liquidacion_ars, tasa_cambio, tipo)
         VALUES ('legacy-v6', 'USD', NOW(6), 100, 100000, 1000, 'VENTA')`)

    const get = await request.get(`${BASE}/operaciones/legacy-v6`, { headers: await headers(request) })
    expect(get.ok()).toBeTruthy()
    expect((await get.json()).medioPago).toBe('ARS')
    expect(getSaldo('PTRANS')).toBe(0)
  })
})
