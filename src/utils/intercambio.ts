// Reglas de intercambio compartidas por el modal y la tabla. Deben coincidir con IntercambioService del backend.

export const USD = 'USD'
export const CONTRAPARTES_USD = ['EUR', 'BRL', 'USDT'] as const
export const MONEDAS_INTERCAMBIO = [USD, ...CONTRAPARTES_USD] as const
export type MonedaIntercambio = typeof MONEDAS_INTERCAMBIO[number]

/** Monedas que puede recibir el cliente según lo que entrega: no-USD → solo USD; USD → EUR/BRL/USDT. */
export function monedasSalidaPermitidas(entrada: string): MonedaIntercambio[] {
  if (!entrada) return []
  return entrada === USD ? [...CONTRAPARTES_USD] : [USD]
}

/** La moneda no-USD del par, en la que se expresa la cotización. */
export function monedaCotizada(from: string, to: string): string {
  return from === USD ? to : from
}

/**
 * Monto que recibe el cliente: multiplica si entrega la moneda no-USD, divide si entrega USD.
 * Redondea a 8 decimales antes del floor para evitar errores de punto flotante (100 × 1.14 = 113.999…).
 * Devuelve null si los datos no permiten calcular.
 */
export function calcularSalidaIntercambio(
  entrada: number,
  from: string,
  to: string,
  cotizacion: number,
): number | null {
  if (!from || !to || !(entrada > 0) || !(cotizacion > 0)) return null
  const exacto = from === USD ? entrada / cotizacion : entrada * cotizacion
  return Math.floor(Number(exacto.toFixed(8)))
}

const formatNumero = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 4 })

/** "1 EUR = 1,14 USD", siempre con la moneda no-USD a la izquierda. */
export function formatCotizacionIntercambio(from: string, to: string, cotizacion: number): string {
  return `1 ${monedaCotizada(from, to)} = ${formatNumero(cotizacion)} ${USD}`
}

/** "100 EUR → 114 USD" */
export function formatMovimientoIntercambio(
  montoEntrada: number,
  from: string,
  montoSalida: number,
  to: string,
): string {
  return `${formatNumero(montoEntrada)} ${from} → ${formatNumero(montoSalida)} ${to}`
}
