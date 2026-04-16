export interface BackendBalance {
  activo: string
  saldo: number
}

export interface CurrencyBalanceCard {
  currency: string
  symbol: string
  amount: number
}

export interface BalancesApiResponse {
  balances: BackendBalance[]
  balanceTotal: number
  cotizacionFecha: string
}

const symbolMap: Record<string, string> = {
  ARS: "$AR",
  EUR: "€",
  USD: "$",
  BRL: "R$",
  USDT: "₮",
  PTRANS: "$T",
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

export const balancesApiResponseToResult = (
  payload: unknown,
): { cards: CurrencyBalanceCard[]; balanceTotal: number } => {
  if (!payload || typeof payload !== "object") return { cards: [], balanceTotal: 0 }
  const data = payload as BalancesApiResponse
  return {
    cards: balancesResponseToCards(data.balances),
    balanceTotal: typeof data.balanceTotal === "number" ? data.balanceTotal : 0,
  }
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
