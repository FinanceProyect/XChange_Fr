export const MONEDAS = ["ARS", "USD", "EUR", "BRL", "USDT", "PTRANS"] as const

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const SIMBOLOS: Record<string, string> = {
  ARS: "$AR",
  EUR: "€",
  USD: "$",
  BRL: "R$",
  USDT: "₮",
  PTRANS: "$T",
}

export const simboloMoneda = (moneda: string) => SIMBOLOS[moneda] ?? moneda

/** "2026-10-20" → "20/10/2026" sin pasar por Date (evita el corrimiento de zona horaria). */
export const formatFecha = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export const hoyISO = () => {
  const now = new Date()
  const pad = (n: number) => `${n}`.padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
