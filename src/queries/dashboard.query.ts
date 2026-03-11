import { useQuery } from "@tanstack/react-query"
import { getStats } from "../services/dashboard.service"

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getStats,
  })
}
