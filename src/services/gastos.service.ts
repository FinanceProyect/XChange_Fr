import { apiClient } from "../api/client"

export interface GastoDTO {
  id: string
  categoriaId: string
  categoria: string
  moneda: string
  monto: number
  fecha: string
  detalle: string | null
  beneficiario: string | null
}

export interface GastoRequest {
  categoriaId: string
  moneda: string
  monto: number
  fecha: string
  detalle?: string | null
  beneficiario?: string | null
}

export interface ResumenMonedaDTO {
  moneda: string
  total: number
}

export interface GastosFiltros {
  anio: number
  mes: number
  categoriaId?: string
  beneficiario?: string
}

const toParams = (f: GastosFiltros) => ({
  anio: f.anio,
  mes: f.mes,
  ...(f.categoriaId ? { categoriaId: f.categoriaId } : {}),
  ...(f.beneficiario ? { beneficiario: f.beneficiario } : {}),
})

export const getAll = async (f: GastosFiltros) => {
  const response = await apiClient.get<GastoDTO[]>("gastos", { params: toParams(f) })
  return response.data
}

export const getResumen = async (f: GastosFiltros) => {
  const response = await apiClient.get<ResumenMonedaDTO[]>("gastos/resumen", { params: toParams(f) })
  return response.data
}

export const getBeneficiarios = async (q: string) => {
  const response = await apiClient.get<string[]>("gastos/beneficiarios", { params: { q } })
  return response.data
}

export const create = async (data: GastoRequest) => {
  const response = await apiClient.post<GastoDTO>("gastos", data)
  return response.data
}

export const update = async (id: string, data: GastoRequest) => {
  const response = await apiClient.put<GastoDTO>(`gastos/${id}`, data)
  return response.data
}

export const remove = async (id: string) => {
  await apiClient.delete(`gastos/${id}`)
}
