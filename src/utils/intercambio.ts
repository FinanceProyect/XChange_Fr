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

/**
 * Monto que recibe el cliente. La cotización son unidades de la moneda no-USD por 1 USD:
 * multiplica si el cliente entrega USD, divide si entrega la moneda no-USD.
 * Redondea a 8 decimales antes del floor para evitar errores de punto flotante.
 * Devuelve null si los datos no permiten calcular.
 */
export function calcularSalidaIntercambio(
  entrada: number,
  from: string,
  to: string,
  cotizacion: number,
): number | null {
  if (!from || !to || !(entrada > 0) || !(cotizacion > 0)) return null
  const exacto = from === USD ? entrada * cotizacion : entrada / cotizacion
  return Math.floor(Number(exacto.toFixed(8)))
}

const formatNumero = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 4 })

/** "1 USD = 0,85 EUR": USD siempre como moneda base, sin importar el sentido del intercambio. */
export function formatCotizacionIntercambio(from: string, to: string, cotizacion: number): string {
  const noUsd = from === USD ? to : from
  return `1 ${USD} = ${formatNumero(cotizacion)} ${noUsd}`
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
