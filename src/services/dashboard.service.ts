import { apiClient } from "../api/client"

// TODO: Adjust endpoint path when backend is ready
export const getStats = async () => {
  const response = await apiClient.get("/dashboard/stats")
  return response.data
}

// Si se pasa true, retorna el objeto completo (balances y balanceTotal)
export const getCurrencyBalances = async (fullObject = false) => {
  const response = await apiClient.get("/balance");
  return fullObject ? response.data : response.data.balances;
};

export const getBalanceSnapshots = async (fecha: string) => {
  const response = await apiClient.get("/balance/stats", {
    params: { fecha },
  })
  return response.data
}
