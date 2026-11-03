import { test, expect } from '@playwright/test'
import { getToken, registrarIntercambio } from '../support/api'
import { contarIntercambios, getSaldo, resetEstado, setSaldo, sql } from '../support/db'

// Integración backend real (Spring + MySQL). Cubre specs/intercambio-divisas.

let token: string

test.beforeAll(async ({ request }) => {
  token = await getToken(request)
})

test.beforeEach(() => {
  resetEstado()
})

test.describe('cálculo de montoSalida y cotización', () => {
  test('cliente entrega EUR 85 a 0,85 y recibe 100 USD; cotización persistida tal cual', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.montoSalida).toBe(100)
    expect(body.tasaCambio).toBe(0.85)
  })

  test('cliente entrega USD 200 a 0,85 y recibe 170 EUR', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'USD', montoEntrada: 200, activoSalida: 'EUR', cotizacion: 0.85,
    })
    expect(res.status()).toBe(201)
    expect((await res.json()).montoSalida).toBe(170)
  })

  test('cliente entrega USD 1.000 a 5,5 y recibe 5.500 BRL', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'USD', montoEntrada: 1000, activoSalida: 'BRL', cotizacion: 5.5,
    })
    expect(res.status()).toBe(201)
    expect((await res.json()).montoSalida).toBe(5500)
  })

  test('cliente entrega BRL 5.500 a 5,5 y recibe 1.000 USD', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'BRL', montoEntrada: 5500, activoSalida: 'USD', cotizacion: 5.5,
    })
    expect(res.status()).toBe(201)
    expect((await res.json()).montoSalida).toBe(1000)
  })

  test('redondea hacia abajo al entregar USD: 201 a 0,85 da 170', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'USD', montoEntrada: 201, activoSalida: 'EUR', cotizacion: 0.85,
    })
    expect((await res.json()).montoSalida).toBe(170)
  })

  test('redondea hacia abajo al entregar la moneda no-USD: 99 EUR a 0,88 da 112', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 99, activoSalida: 'USD', cotizacion: 0.88,
    })
    expect((await res.json()).montoSalida).toBe(112)
  })

  test('USDT 500 a 1,02 contra USD da 490', async ({ request }) => {
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'USDT', montoEntrada: 500, activoSalida: 'USD', cotizacion: 1.02,
    })
    expect((await res.json()).montoSalida).toBe(490)
  })
})

test.describe('balances', () => {
  test('EUR 85 a 0,85: suma 85 EUR, resta 100 USD y no toca ARS', async ({ request }) => {
    const eur0 = getSaldo('EUR'), usd0 = getSaldo('USD'), ars0 = getSaldo('ARS')
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    expect(res.status()).toBe(201)
    expect(getSaldo('EUR')).toBeCloseTo(eur0 + 85, 4)
    expect(getSaldo('USD')).toBeCloseTo(usd0 - 100, 4)
    expect(getSaldo('ARS')).toBeCloseTo(ars0, 4)
  })

  test('USDT 500 a 1,02: suma 500 USDT y resta 490 USD', async ({ request }) => {
    const usdt0 = getSaldo('USDT'), usd0 = getSaldo('USD')
    await registrarIntercambio(request, token, {
      activoEntrada: 'USDT', montoEntrada: 500, activoSalida: 'USD', cotizacion: 1.02,
    })
    expect(getSaldo('USDT')).toBeCloseTo(usdt0 + 500, 4)
    expect(getSaldo('USD')).toBeCloseTo(usd0 - 490, 4)
  })

  test('saldo insuficiente en el activo a entregar: rechaza, no guarda y no altera ningún balance', async ({ request }) => {
    setSaldo('USD', 50) // necesita 100 USD
    const eur0 = getSaldo('EUR')
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
    expect((await res.json()).error).toContain('Saldo insuficiente')
    expect(contarIntercambios()).toBe(0)
    expect(getSaldo('EUR')).toBeCloseTo(eur0, 4) // rollback: el EUR entrante no quedó registrado
    expect(getSaldo('USD')).toBeCloseTo(50, 4)
  })

  test('saldo bajo del activo a recibir no bloquea: EUR en cero no impide registrar', async ({ request }) => {
    setSaldo('EUR', 0)
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    expect(res.status()).toBe(201)
    expect(getSaldo('EUR')).toBeCloseTo(85, 4)
  })
})

test.describe('rechazos sin cambios', () => {
  const rechazos: Array<[string, string, string, number, number, string]> = [
    ['par sin USD', 'EUR', 'BRL', 10, 1.14, 'Par de intercambio no permitido'],
    ['par con ARS', 'ARS', 'USD', 100, 0.85, 'Par de intercambio no permitido'],
    ['mismo activo', 'USD', 'USD', 100, 0.85, 'dos activos distintos'],
    ['resultado menor a una unidad', 'USD', 'EUR', 1, 0.85, 'menor a una unidad'],
  ]

  for (const [nombre, entrada, salida, monto, cotizacion, mensaje] of rechazos) {
    test(`${nombre}: rechaza y no persiste`, async ({ request }) => {
      const res = await registrarIntercambio(request, token, {
        activoEntrada: entrada, montoEntrada: monto, activoSalida: salida, cotizacion,
      })
      expect(res.status()).toBeGreaterThanOrEqual(400)
      expect(res.status()).toBeLessThan(500)
      expect((await res.json()).error).toContain(mensaje)
      expect(contarIntercambios()).toBe(0)
    })
  }

  test('cotización nula: rechaza y no modifica balances', async ({ request }) => {
    const eur0 = getSaldo('EUR')
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: null as unknown as number,
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
    expect(contarIntercambios()).toBe(0)
    expect(getSaldo('EUR')).toBeCloseTo(eur0, 4)
  })

  for (const cotizacion of [0, -0.85]) {
    test(`cotización ${cotizacion}: rechaza y no modifica balances`, async ({ request }) => {
      const eur0 = getSaldo('EUR'), usd0 = getSaldo('USD')
      const res = await registrarIntercambio(request, token, {
        activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion,
      })
      expect(res.status()).toBeGreaterThanOrEqual(400)
      expect(res.status()).toBeLessThan(500)
      expect(contarIntercambios()).toBe(0)
      expect(getSaldo('EUR')).toBeCloseTo(eur0, 4)
      expect(getSaldo('USD')).toBeCloseTo(usd0, 4)
    })
  }
})

test.describe('consulta', () => {
  test('el listado incluye el intercambio registrado, con la cotización en la nueva convención', async ({ request }) => {
    const reg = await registrarIntercambio(request, token, {
      activoEntrada: 'USD', montoEntrada: 1000, activoSalida: 'BRL', cotizacion: 5.5,
    })
    const creado = await reg.json()
    await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })

    const res = await request.get('/api/intercambios', { headers: { Authorization: `Bearer ${token}` } })
    expect(res.ok()).toBeTruthy()
    const pagina = await res.json()
    // Orden por fecha descendente (specs/operaciones-intercambio, listado)
    const fechas = pagina.content.map((i: { fechaHora: string }) => new Date(i.fechaHora).getTime())
    expect(fechas).toEqual([...fechas].sort((a: number, b: number) => b - a))
    const fila = pagina.content.find((i: { id: string }) => i.id === creado.id)
    expect(fila).toBeDefined()
    expect(fila.tasaCambio).toBe(5.5)
    expect(fila.montoSalida).toBe(5500)
  })

  test('GET por id devuelve el mismo intercambio', async ({ request }) => {
    const reg = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    const creado = await reg.json()
    const res = await request.get(`/api/intercambios/${creado.id}`, { headers: { Authorization: `Bearer ${token}` } })
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).montoSalida).toBe(100)
  })

  test('no se puede editar ni eliminar un intercambio desde la API', async ({ request }) => {
    const reg = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    const id = (await reg.json()).id
    const headers = { Authorization: `Bearer ${token}` }
    const del = await request.delete(`/api/intercambios/${id}`, { headers })
    const put = await request.put(`/api/intercambios/${id}`, { headers, data: {} })
    expect(del.status()).toBeGreaterThanOrEqual(400)
    expect(put.status()).toBeGreaterThanOrEqual(400)
    expect(contarIntercambios()).toBe(1)
  })
})

test('la precisión de tasa_cambio es DECIMAL(18,8) en la base de pruebas', () => {
  const tipo = sql(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'intercambios' AND COLUMN_NAME = 'tasa_cambio'`,
  )
  expect(tipo).toBe('decimal(18,8)')
})
