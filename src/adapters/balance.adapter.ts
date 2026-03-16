export interface BackendBalance {
  activo: string
  saldo: number
}

export interface CurrencyBalanceCard {
  currency: string
  symbol: string
  amount: number
}

const symbolMap: Record<string, string> = {
  EUR: "€",
  USD: "$",
  BRL: "R$",
  USDT: "₮",
}

const isBackendBalance = (value: unknown): value is BackendBalance => {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return typeof record.activo === "string" && typeof record.saldo === "number"
}

export const balancesResponseToCards = (payload: unknown): CurrencyBalanceCard[] => {
  if (!Array.isArray(payload)) return []
  return payload.filter(isBackendBalance).map((balance) => toCurrencyBalanceCard(balance))
}

export const toCurrencyBalanceCard = (
  balance: BackendBalance,
): CurrencyBalanceCard => {
  const symbol = symbolMap[balance.activo] ?? balance.activo
  return {
    currency: balance.activo,
    symbol,
    amount: balance.saldo,
  }
}
