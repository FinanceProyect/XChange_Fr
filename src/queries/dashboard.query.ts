import { useQuery } from "@tanstack/react-query"
import { balancesApiResponseToResult } from "../adapters/balance.adapter"
import {
  balanceSnapshotsResponseToPoints,
  buildDailyPoints,
  buildHourlyGridPoints,
  buildMonthlyPoints,
  type ChartPoint,
} from "../adapters/balanceSnapshot.adapter"
import {
  getBalanceSnapshots,
  getBalanceSnapshotsForDates,
  getCurrencyBalances,
  getStats,
} from "../services/dashboard.service"

const ONE_HOUR_MS = 60 * 60 * 1000
const FIFTEEN_MIN_MS = 15 * 60 * 1000

const getUserLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getStats,
  })
}

export const useDashboardCurrencyBalances = () => {
  return useQuery({
    queryKey: ["dashboard", "balances"],
    queryFn: async () => {
      const response = await getCurrencyBalances()
      return balancesApiResponseToResult(response)
    },
  })
}

export const useBalanceSnapshots = () => {
  const fecha = getUserLocalDateString()

  return useQuery({
    queryKey: ["dashboard", "balance-snapshots", fecha],
    queryFn: async () => {
      const response = await getBalanceSnapshots(fecha)
      return balanceSnapshotsResponseToPoints(response)
    },
    gcTime: ONE_HOUR_MS,
    refetchInterval: FIFTEEN_MIN_MS,
  })
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const getDateString = (date: Date): string => {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getLastNDays = (n: number): string[] => {
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (n - 1 - i))
    return getDateString(d)
  })
}

const getLastNMonthDates = (n: number): string[] => {
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (n - 1 - i) + 1, 0)
    if (d > today) return getDateString(today)
    return getDateString(d)
  })
}

export type PortfolioPeriod = "hour" | "day" | "month"

export const usePortfolioChartData = (
  period: PortfolioPeriod,
): { data: ChartPoint[]; isLoading: boolean; isFetching: boolean; refetch: () => void } => {
  const hourQuery = useBalanceSnapshots()

  const dayDates = period === "day" ? getLastNDays(14) : []
  const dayQuery = useQuery({
    queryKey: ["portfolio", "day", dayDates[0] ?? "", dayDates[dayDates.length - 1] ?? ""],
    queryFn: async () => {
      const responses = await getBalanceSnapshotsForDates(dayDates)
      const entries = dayDates.map((date, i) => ({
        date,
        snapshots: balanceSnapshotsResponseToPoints(responses[i]),
      }))
      return buildDailyPoints(entries)
    },
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    enabled: period === "day",
  })

  const monthDates = period === "month" ? getLastNMonthDates(12) : []
  const monthQuery = useQuery({
    queryKey: ["portfolio", "month", monthDates[0] ?? "", monthDates[monthDates.length - 1] ?? ""],
    queryFn: async () => {
      const responses = await getBalanceSnapshotsForDates(monthDates)
      const entries = monthDates.map((date, i) => ({
        date,
        snapshots: balanceSnapshotsResponseToPoints(responses[i]),
      }))
      return buildMonthlyPoints(entries)
    },
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    enabled: period === "month",
  })

  if (period === "hour") {
    const snapshots = hourQuery.data ?? []
    return {
      data: buildHourlyGridPoints(snapshots),
      isLoading: hourQuery.isLoading,
      isFetching: hourQuery.isFetching,
      refetch: hourQuery.refetch,
    }
  }

  if (period === "day") {
    return {
      data: dayQuery.data ?? [],
      isLoading: dayQuery.isLoading,
      isFetching: dayQuery.isFetching,
      refetch: dayQuery.refetch,
    }
  }

  return {
    data: monthQuery.data ?? [],
    isLoading: monthQuery.isLoading,
    isFetching: monthQuery.isFetching,
    refetch: monthQuery.refetch,
  }
}
