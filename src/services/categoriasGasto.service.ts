import { apiClient } from "../api/client"

export interface CategoriaGastoDTO {
  id: string
  nombre: string
}

export const getAll = async () => {
  const response = await apiClient.get<CategoriaGastoDTO[]>("categorias-gasto")
  return response.data
}

export const create = async (nombre: string) => {
  const response = await apiClient.post<CategoriaGastoDTO>("categorias-gasto", { nombre })
  return response.data
}
