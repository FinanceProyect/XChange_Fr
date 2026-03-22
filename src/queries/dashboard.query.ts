import { useQuery } from "@tanstack/react-query"
import { balancesResponseToCards } from "../adapters/balance.adapter"
import { balanceSnapshotsResponseToPoints } from "../adapters/balanceSnapshot.adapter"
import {
  getBalanceSnapshots,
  getCurrencyBalances,
  getStats,
} from "../services/dashboard.service"

const ONE_HOUR_MS = 60 * 60 * 1000

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
      return balancesResponseToCards(response)
    },
  })
}

export const useBalanceSnapshots = () => {
  return useQuery({
    queryKey: ["dashboard", "balance-snapshots"],
    queryFn: async () => {
      const response = await getBalanceSnapshots()
      return balanceSnapshotsResponseToPoints(response)
    },
    refetchInterval: ONE_HOUR_MS,
    refetchIntervalInBackground: true,
    gcTime: ONE_HOUR_MS,
  })
}
