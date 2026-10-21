import { apiClient } from "../api/client"

// TODO: Adjust endpoint path when backend is ready
export const getStats = async () => {
  const response = await apiClient.get("dashboard/stats")
  return response.data
}

export const getCurrencyBalances = async () => {
  const response = await apiClient.get("balance")
  return response.data
}

export const getBalanceSnapshots = async (fecha: string) => {
  const response = await apiClient.get("balance/stats", {
    params: { fecha },
  })
  return response.data
}

export const getBalanceSnapshotsForDates = async (dates: string[]) => {
  const responses = await Promise.all(dates.map((fecha) => getBalanceSnapshots(fecha)))
  return responses
}
