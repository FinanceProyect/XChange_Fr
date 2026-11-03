import { test, expect, type Page } from '@playwright/test'
import { getSaldo, setSaldo, sql } from '../support/db'

// UI de punta a punta del medio de pago (change medio-pago-operaciones), contra el backend real.
// Sesión por storageState (e2e/auth.setup.ts). Cubre el selector del modal, el resumen (paso 3),
// el listado de Operaciones y el mensaje de error del backend.

function resetMedioPago() {
  sql('DELETE FROM deudas')
  sql('DELETE FROM operaciones')
  for (const a of ['USD', 'EUR', 'BRL', 'USDT']) setSaldo(a, 100000)
  setSaldo('ARS', 1000000)
  setSaldo('PTRANS', 0)
}

async function abrirAlta(page: Page) {
  await page.goto('/operations')
  await page.getByRole('button', { name: /Añadir/ }).first().click()
}

const selectMedio = (page: Page) => page.locator('label:text-is("Medio de pago") + select')
const selectMoneda = (page: Page) => page.locator('label:text-is("Moneda") + select')
const inputCantidad = (page: Page) => page.locator('label:text-is("Cantidad") + input')
const inputCotizacion = (page: Page) => page.locator('label:text-is("Cotización") + input')

async function completarPaso1(page: Page, d: { tipo: 'Compra' | 'Venta'; moneda: string; cantidad: string; cotizacion: string }) {
  await page.getByRole('button', { name: d.tipo, exact: true }).click()
  await selectMoneda(page).selectOption(d.moneda)
  await inputCantidad(page).fill(d.cantidad)
  await inputCotizacion(page).fill(d.cotizacion)
}

test.beforeEach(() => {
  resetMedioPago()
})

test.describe('selector Medio de pago', () => {
  test('visible con Venta y divisa, con Pesos seleccionado por defecto', async ({ page }) => {
    await abrirAlta(page)
    await page.getByRole('button', { name: 'Venta', exact: true }).click()
    await selectMoneda(page).selectOption('USD')

    await expect(selectMedio(page)).toBeVisible()
    await expect(selectMedio(page)).toHaveValue('ARS')
    const opciones = await selectMedio(page).locator('option').allTextContents()
    expect(opciones).toEqual(['Pesos', 'Pesos transferencia'])
  })

  test('oculto para metal', async ({ page }) => {
    await abrirAlta(page)
    await page.getByRole('button', { name: 'Compra', exact: true }).click()
    await selectMoneda(page).selectOption('METAL')

    await expect(page.locator('label:text-is("Medio de pago")')).toHaveCount(0)
  })
})

test.describe('flujo completo con pesos transferencia', () => {
  test('venta USD con Pesos transferencia: resumen, listado y saldos', async ({ page }) => {
    await abrirAlta(page)
    await completarPaso1(page, { tipo: 'Venta', moneda: 'USD', cantidad: '100', cotizacion: '1000' })
    await selectMedio(page).selectOption('PTRANS')

    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    // Paso 3: el resumen muestra el medio elegido
    await expect(page.locator('span:text-is("Medio de pago") + span')).toHaveText('Pesos transferencia')

    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Guardar', exact: true })).toHaveCount(0)

    // Listado: la fila muestra el medio
    await expect(page.getByText('Pesos transferencia', { exact: true }).first()).toBeVisible()

    expect(getSaldo('PTRANS')).toBe(100000)
    expect(getSaldo('USD')).toBe(99900)
    expect(getSaldo('ARS')).toBe(1000000)
  })

  test('compra con Pesos transferencia sin saldo: muestra el error del backend y el modal queda abierto', async ({ page }) => {
    await abrirAlta(page)
    await completarPaso1(page, { tipo: 'Compra', moneda: 'USD', cantidad: '100', cotizacion: '1500' })
    await selectMedio(page).selectOption('PTRANS')

    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()

    await expect(page.getByRole('alert')).toHaveText('Saldo insuficiente en PTRANS')
    await expect(page.getByRole('button', { name: 'Guardar', exact: true })).toBeVisible()
    expect(getSaldo('PTRANS')).toBe(0)
    expect(Number(sql('SELECT COUNT(*) FROM operaciones'))).toBe(0)
  })
})
