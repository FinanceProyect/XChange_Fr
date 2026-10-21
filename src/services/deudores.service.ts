import { apiClient } from "../api/client"

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get("deudores", { params })
  return response.data
}

export const getById = async (id: string) => {
  const response = await apiClient.get(`deudores/${id}`)
  return response.data
}

export const create = async (data: unknown) => {
  const response = await apiClient.post("deudores", data)
  return response.data
}

export const update = async (id: string, data: unknown) => {
  const response = await apiClient.put(`deudores/${id}`, data)
  return response.data
}

export const pagar = async (data: {
  id: string
  pagos: { moneda: string; monto: number }[]
}) => {
  const response = await apiClient.put("deudores/pagar", data)
  return response.data
}

export const remove = async (id: string) => {
  const response = await apiClient.delete(`deudores/${id}`)
  return response.data
}

export const getSugerencias = async (nombre: string) => {
  const response = await apiClient.get("deudores/sugerencias", { params: { nombre } })
  return response.data
}
