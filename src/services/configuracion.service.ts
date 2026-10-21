import { apiClient } from '../api/client'

export const getConfiguracion = async () => {
  const response = await apiClient.get('configuracion')
  return response.data
}

export const saveConfiguracion = async (data: unknown) => {
  const response = await apiClient.put('configuracion', data)
  return response.data
}
