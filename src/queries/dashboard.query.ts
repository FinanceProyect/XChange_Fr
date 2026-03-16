import { useQuery } from "@tanstack/react-query"
import { balancesResponseToCards } from "../adapters/balance.adapter"
import { getCurrencyBalances, getStats } from "../services/dashboard.service"

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
