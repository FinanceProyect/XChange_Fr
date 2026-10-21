import { apiClient } from '../api/client'

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get('acreedores', { params })
  return response.data
}

export const getPendientes = async () => {
  const response = await apiClient.get('acreedores/pendientes')
  return response.data
}

export const getSugerencias = async (nombre: string) => {
  const response = await apiClient.get('acreedores/sugerencias', { params: { nombre } })
  return response.data
}

export const getById = async (id: string) => {
  const response = await apiClient.get(`acreedores/${id}`)
  return response.data
}

export const create = async (data: unknown) => {
  const response = await apiClient.post('acreedores', data)
  return response.data
}

export const pagar = async (data: {
  id: string
  pagos: { codigoDivisa: string; monto: number }[]
}) => {
  const response = await apiClient.put('acreedores/pagar', data)
  return response.data
}

export const remove = async (id: string) => {
  const response = await apiClient.delete(`acreedores/${id}`)
  return response.data
}
