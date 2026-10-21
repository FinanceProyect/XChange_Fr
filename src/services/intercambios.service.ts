import { apiClient } from '../api/client'

// La cotización expresa cuántos USD vale 1 unidad de la moneda no-USD; el backend calcula montoSalida.
export interface RegistrarIntercambioPayload {
  activoEntrada: string
  montoEntrada: number
  activoSalida: string
  cotizacion: number
}

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get('intercambios', { params })
  const data = response.data
  return Array.isArray(data) ? data : (data?.content ?? [])
}

export const create = async (data: RegistrarIntercambioPayload) => {
  const response = await apiClient.post('intercambios', data)
  return response.data
}
