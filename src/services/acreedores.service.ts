import { apiClient } from '../api/client'

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get('/acreedores', { params })
  return response.data
}

export const getById = async (id: string) => {
  const response = await apiClient.get(`/acreedores/${id}`)
  return response.data
}

export const create = async (data: unknown) => {
  const response = await apiClient.post('/acreedores', data)
  return response.data
}

export const update = async (id: string, data: unknown) => {
  const response = await apiClient.put(`/acreedores/${id}`, data)
  return response.data
}

export const pagar = async (id: string, importe: number) => {
  const response = await apiClient.put('/acreedores/pagar', { id, importe })
  return response.data
}

export const remove = async (id: string) => {
  const response = await apiClient.delete(`/acreedores/${id}`)
  return response.data
}
