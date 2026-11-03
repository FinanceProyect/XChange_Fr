import { test, expect } from '@playwright/test'
import {
  calcularSalidaIntercambio,
  formatCotizacionIntercambio,
  monedasSalidaPermitidas,
} from '../../src/utils/intercambio'

// Convención: la cotización son unidades de la moneda no-USD por 1 USD.
// Spec: specs/intercambio-divisas (cotización, redondeo) y specs/operaciones-intercambio (vista previa).

test.describe('calcularSalidaIntercambio', () => {
  test('cliente entrega EUR y recibe USD: divide sobre la cotización', () => {
    expect(calcularSalidaIntercambio(85, 'EUR', 'USD', 0.85)).toBe(100)
  })

  test('cliente entrega USD y recibe EUR: multiplica por la cotización', () => {
    expect(calcularSalidaIntercambio(200, 'USD', 'EUR', 0.85)).toBe(170)
  })

  test('cliente entrega USD y recibe BRL: 1.000 USD a 5,5 dan 5.500 BRL', () => {
    expect(calcularSalidaIntercambio(1000, 'USD', 'BRL', 5.5)).toBe(5500)
  })

  test('cliente entrega BRL y recibe USD: 5.500 BRL a 5,5 dan 1.000 USD', () => {
    expect(calcularSalidaIntercambio(5500, 'BRL', 'USD', 5.5)).toBe(1000)
  })

  test('USDT contra USD: 500 USDT a 1,02 dan 490 USD', () => {
    expect(calcularSalidaIntercambio(500, 'USDT', 'USD', 1.02)).toBe(490)
  })

  test('redondea hacia abajo al entregar USD (201 × 0,85 = 170,85 → 170)', () => {
    expect(calcularSalidaIntercambio(201, 'USD', 'EUR', 0.85)).toBe(170)
  })

  test('redondea hacia abajo al entregar la moneda no-USD (99 ÷ 0,88 = 112,5 → 112)', () => {
    expect(calcularSalidaIntercambio(99, 'EUR', 'USD', 0.88)).toBe(112)
  })

  test('resultado menor a una unidad da 0 (el backend lo rechaza)', () => {
    expect(calcularSalidaIntercambio(1, 'USD', 'EUR', 0.85)).toBe(0)
  })

  test('sin datos suficientes devuelve null', () => {
    expect(calcularSalidaIntercambio(0, 'EUR', 'USD', 0.85)).toBeNull()
    expect(calcularSalidaIntercambio(-5, 'EUR', 'USD', 0.85)).toBeNull()
    expect(calcularSalidaIntercambio(100, 'EUR', 'USD', 0)).toBeNull()
    expect(calcularSalidaIntercambio(100, 'EUR', 'USD', NaN)).toBeNull()
    expect(calcularSalidaIntercambio(100, '', 'USD', 0.85)).toBeNull()
    expect(calcularSalidaIntercambio(100, 'EUR', '', 0.85)).toBeNull()
  })
})

test.describe('formatCotizacionIntercambio', () => {
  test('USD siempre es la base, sin importar el sentido: USD → BRL', () => {
    expect(formatCotizacionIntercambio('USD', 'BRL', 5.5)).toBe('1 USD = 5,5 BRL')
  })

  test('USD → EUR muestra la moneda no-USD como cotizada', () => {
    expect(formatCotizacionIntercambio('USD', 'EUR', 0.85)).toBe('1 USD = 0,85 EUR')
  })

  test('EUR → USD (sentido inverso) produce el mismo formato', () => {
    expect(formatCotizacionIntercambio('EUR', 'USD', 0.85)).toBe('1 USD = 0,85 EUR')
  })
})

test.describe('monedasSalidaPermitidas', () => {
  test('moneda no-USD solo permite recibir USD', () => {
    expect(monedasSalidaPermitidas('EUR')).toEqual(['USD'])
    expect(monedasSalidaPermitidas('BRL')).toEqual(['USD'])
    expect(monedasSalidaPermitidas('USDT')).toEqual(['USD'])
  })

  test('USD permite recibir EUR, BRL y USDT', () => {
    expect(monedasSalidaPermitidas('USD')).toEqual(['EUR', 'BRL', 'USDT'])
  })

  test('sin moneda de entrada no hay opciones', () => {
    expect(monedasSalidaPermitidas('')).toEqual([])
  })
})
