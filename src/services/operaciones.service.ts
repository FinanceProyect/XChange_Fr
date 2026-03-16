import { apiClient } from "../api/client"

export const getAll = async (params?: unknown) => {
  const response = await apiClient.get("/operaciones", { params })
  return response.data
}

export const getById = async (id: string) => {
  const response = await apiClient.get(`/operaciones/${id}`)
  return response.data
}

// Enruta a /compra o /venta según el campo `tipo` del payload
export const create = async (data: unknown) => {
  const payload = data as { tipo?: string }
  const endpoint =
    payload.tipo === 'COMPRA' || payload.tipo === 'Compra'
      ? '/operaciones/compra'
      : '/operaciones/venta'
  const response = await apiClient.post(endpoint, data)
  return response.data
}

export const update = async (id: string, data: unknown) => {
  const response = await apiClient.put(`/operaciones/${id}`, data)
  return response.data
}

export const remove = async (id: string) => {
  const response = await apiClient.delete(`/operaciones/${id}`)
  return response.data
}

// Genera la deuda vinculada a una operación — POST /operaciones/{id}/deuda?deudorId=
export const generarDeuda = async (operacionId: string, deudorId: string) => {
  const response = await apiClient.post(
    `/operaciones/${operacionId}/deuda`,
    null,
    { params: { deudorId } },
  )
  return response.data
}
