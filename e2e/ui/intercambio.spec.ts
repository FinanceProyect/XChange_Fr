import { test, expect, type Page, type Locator } from '@playwright/test'
import { getToken, registrarIntercambio } from '../support/api'
import { contarIntercambios, getSaldo, resetEstado, setSaldo } from '../support/db'

// UI de punta a punta contra el backend real. Cubre specs/operaciones-intercambio.
// La sesión viene de e2e/auth.setup.ts (storageState): no se hace login por prueba.

/** Contenedor del campo de formulario identificado por su etiqueta visible. */
function campo(page: Page, etiqueta: string): Locator {
  return page
    .locator('div.flex.flex-col.gap-1')
    .filter({ has: page.locator('label', { hasText: etiqueta }) })
    .first()
}

async function abrirIntercambio(page: Page) {
  await page.goto('/operations')
  await page.getByRole('button', { name: /Añadir/ }).first().click()
  await page.getByRole('button', { name: 'Intercambio', exact: true }).click()
}

async function completarIntercambio(page: Page, d: {
  monto: string; entrega: string; recibe: string; cotizacion: string
}) {
  await campo(page, 'Cliente entrega').locator('input[type="number"]').fill(d.monto)
  await campo(page, 'Cliente entrega').locator('select').selectOption(d.entrega)
  await campo(page, 'Cliente recibe').locator('select').selectOption(d.recibe)
  await campo(page, 'Cotización').locator('input').fill(d.cotizacion)
}

/** Filas reales de la tabla de Operaciones (la tabla rellena con filas "placeholder" si hay pocas). */
function filasReales(page: Page): Locator {
  return page.locator('tbody tr').filter({ hasNotText: 'placeholder' })
}

test.beforeEach(() => {
  resetEstado()
})

test.describe('modal de intercambio', () => {
  test('elegir Intercambio muestra Cliente entrega, Cliente recibe y Cotización, sin metal ni deudor/acreedor', async ({ page }) => {
    await abrirIntercambio(page)
    await expect(page.locator('label', { hasText: 'Cliente entrega' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Cliente recibe' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Cotización' })).toBeVisible()
    await expect(page.getByText('Añadir deudor')).toHaveCount(0)
    await expect(page.getByText('Añadir acreedor')).toHaveCount(0)
  })

  test('moneda no-USD en Cliente entrega: Cliente recibe solo ofrece USD', async ({ page }) => {
    await abrirIntercambio(page)
    await campo(page, 'Cliente entrega').locator('select').selectOption('EUR')
    const opciones = await campo(page, 'Cliente recibe').locator('option').evaluateAll(
      os => os.map(o => (o as HTMLOptionElement).value).filter(Boolean),
    )
    expect(opciones).toEqual(['USD'])
  })

  test('USD en Cliente entrega: Cliente recibe ofrece EUR, BRL y USDT', async ({ page }) => {
    await abrirIntercambio(page)
    await campo(page, 'Cliente entrega').locator('select').selectOption('USD')
    const opciones = await campo(page, 'Cliente recibe').locator('option').evaluateAll(
      os => os.map(o => (o as HTMLOptionElement).value).filter(Boolean),
    )
    expect(opciones).toEqual(['EUR', 'BRL', 'USDT'])
  })

  test('vista previa al entregar EUR: 1 USD = 0,85 EUR y Cliente recibe 100 USD', async ({ page }) => {
    await abrirIntercambio(page)
    await completarIntercambio(page, { monto: '85', entrega: 'EUR', recibe: 'USD', cotizacion: '0.85' })
    await expect(page.getByText('1 USD = 0,85 EUR', { exact: true })).toBeVisible()
    await expect(page.getByText('Cliente recibe: 100 USD', { exact: true })).toBeVisible()
  })

  test('vista previa al entregar USD: 1 USD = 0,85 EUR y Cliente recibe 170 EUR', async ({ page }) => {
    await abrirIntercambio(page)
    await completarIntercambio(page, { monto: '200', entrega: 'USD', recibe: 'EUR', cotizacion: '0.85' })
    await expect(page.getByText('1 USD = 0,85 EUR', { exact: true })).toBeVisible()
    await expect(page.getByText('Cliente recibe: 170 EUR', { exact: true })).toBeVisible()
  })

  test('vista previa con BRL: 1.000 USD a 5,5 da 5.500 BRL', async ({ page }) => {
    await abrirIntercambio(page)
    await completarIntercambio(page, { monto: '1000', entrega: 'USD', recibe: 'BRL', cotizacion: '5.5' })
    await expect(page.getByText('1 USD = 5,5 BRL', { exact: true })).toBeVisible()
    await expect(page.getByText('Cliente recibe: 5.500 BRL', { exact: true })).toBeVisible()
  })

  test('el campo de cotización se etiqueta con la moneda no-USD por 1 USD', async ({ page }) => {
    await abrirIntercambio(page)
    await campo(page, 'Cliente entrega').locator('select').selectOption('BRL')
    await expect(page.getByText('Cotización (BRL por 1 USD)', { exact: true })).toBeVisible()
  })

  test('registro exitoso: resumen, aviso, fila en Operaciones, saldos actualizados', async ({ page }) => {
    const usd0 = getSaldo('USD'), brl0 = getSaldo('BRL')
    await abrirIntercambio(page)
    await completarIntercambio(page, { monto: '1000', entrega: 'USD', recibe: 'BRL', cotizacion: '5.5' })
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Paso de resumen (el paso 2 se omite en intercambios)
    await expect(page.getByText('1 USD = 5,5 BRL', { exact: true })).toBeVisible()
    await expect(page.getByText('5.500 BRL', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Intercambio registrado: el cliente recibe 5.500 BRL')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar' })).toHaveCount(0)
    expect(contarIntercambios()).toBe(1)
    expect(getSaldo('USD')).toBeCloseTo(usd0 + 1000, 4)
    expect(getSaldo('BRL')).toBeCloseTo(brl0 - 5500, 4)
  })

  test('error del backend: saldo insuficiente se muestra y el modal sigue abierto', async ({ page }) => {
    setSaldo('BRL', 0)
    await abrirIntercambio(page)
    await completarIntercambio(page, { monto: '1000', entrega: 'USD', recibe: 'BRL', cotizacion: '5.5' })
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByRole('alert').filter({ hasText: 'Saldo insuficiente' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
    expect(contarIntercambios()).toBe(0)
  })
})

test.describe('referencia del dólar blue', () => {
  test('API disponible: muestra Blue: compra · venta en el modal', async ({ page }) => {
    await page.route('**/api/cotizaciones/blue', route =>
      route.fulfill({ json: { tipo: 'blue', compra: 1200, venta: 1250 } }),
    )
    await abrirIntercambio(page)
    await expect(page.getByText(/Blue: compra .+ · venta .+/)).toBeVisible()
  })

  test('API no disponible: oculta la referencia y permite registrar igual', async ({ page }) => {
    await page.route('**/api/cotizaciones/blue', route => route.abort())
    await abrirIntercambio(page)
    await expect(page.getByText(/Blue: compra/)).toHaveCount(0)
    await completarIntercambio(page, { monto: '85', entrega: 'EUR', recibe: 'USD', cotizacion: '0.85' })
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Intercambio registrado: el cliente recibe 100 USD')).toBeVisible()
  })
})

test.describe('listado de Operaciones', () => {
  test.beforeEach(async ({ request }) => {
    const token = await getToken(request)
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'USD', montoEntrada: 1000, activoSalida: 'BRL', cotizacion: 5.5,
    })
    expect(res.status()).toBe(201)
  })

  test('la fila muestra tipo Intercambio y la cotización como 1 USD = X moneda', async ({ page }) => {
    await page.goto('/operations')
    const fila = filasReales(page).filter({ hasText: 'Intercambio' }).first()
    await expect(fila).toBeVisible()
    await expect(fila).toContainText('1 USD = 5,5 BRL')
  })

  test('filtro por tipo Intercambio: solo muestra intercambios', async ({ page }) => {
    await page.goto('/operations')
    const filtroTipo = page.locator('select', { has: page.locator('option[value="Intercambio"]') }).first()
    await filtroTipo.selectOption('Intercambio')
    await expect(filasReales(page).first()).toContainText('Intercambio')
    const textos = await filasReales(page).allTextContents()
    expect(textos.length).toBeGreaterThan(0)
    for (const t of textos) expect(t).toContain('Intercambio')
  })

  test('filtro por moneda EUR incluye intercambios donde EUR es entregado o recibido', async ({ page, request }) => {
    const token = await getToken(request)
    const res = await registrarIntercambio(request, token, {
      activoEntrada: 'EUR', montoEntrada: 85, activoSalida: 'USD', cotizacion: 0.85,
    })
    expect(res.status()).toBe(201)

    await page.goto('/operations')
    const filtroMoneda = page.locator('select', { has: page.locator('option[value="EUR"]') })
      .filter({ hasNot: page.locator('option[value="Intercambio"]') })
      .first()
    await filtroMoneda.selectOption('EUR')
    // Esperar el resultado filtrado (React re-renderiza después del cambio de select)
    await expect(filasReales(page).filter({ hasText: 'EUR' }).first()).toContainText('Intercambio')
    const textos = await filasReales(page).allTextContents()
    expect(textos.some(t => t.includes('EUR') && t.includes('Intercambio'))).toBeTruthy()
    expect(textos.some(t => t.includes('BRL'))).toBeFalsy() // el intercambio USD→BRL no tiene EUR
  })

  test('la fila de intercambio no ofrece editar ni eliminar', async ({ page }) => {
    await page.goto('/operations')
    const fila = filasReales(page).filter({ hasText: 'Intercambio' }).first()
    await expect(fila).toBeVisible()
    await expect(fila.getByRole('button', { name: /editar|eliminar/i })).toHaveCount(0)
  })
})

test('la navegación no muestra la sección Intercambios', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Intercambios', exact: true })).toHaveCount(0)
  await expect(page.getByRole('navigation').getByText('Intercambios', { exact: true })).toHaveCount(0)
})
