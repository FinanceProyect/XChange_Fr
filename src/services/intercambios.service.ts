import { apiClient } from '../api/client'

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get('/intercambios', { params })
  const data = response.data
  return Array.isArray(data) ? data : (data?.content ?? [])
}

export const create = async (data: unknown) => {
  const response = await apiClient.post('/intercambios', data)
  return response.data
}

export const update = async (id: string, data: unknown) => {
  const response = await apiClient.put(`/intercambios/${id}`, data)
  return response.data
}

export const remove = async (id: string) => {
  const response = await apiClient.delete(`/intercambios/${id}`)
  return response.data
}
