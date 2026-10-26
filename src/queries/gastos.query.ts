import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as gastosSvc from "../services/gastos.service"
import type { GastoRequest, GastosFiltros } from "../services/gastos.service"
import * as categoriasSvc from "../services/categoriasGasto.service"

const KEY = "gastos"
const CATEGORIAS_KEY = "categorias-gasto"

export const useGastos = (filtros: GastosFiltros) =>
  useQuery({
    queryKey: [KEY, "lista", filtros],
    queryFn: () => gastosSvc.getAll(filtros),
  })

export const useResumenGastos = (filtros: GastosFiltros) =>
  useQuery({
    queryKey: [KEY, "resumen", filtros],
    queryFn: () => gastosSvc.getResumen(filtros),
  })

export const useSugerenciasBeneficiario = (q: string) =>
  useQuery({
    queryKey: [KEY, "beneficiarios", q],
    queryFn: () => gastosSvc.getBeneficiarios(q),
    enabled: q.trim().length > 0,
  })

export const useCategoriasGasto = () =>
  useQuery({
    queryKey: [CATEGORIAS_KEY],
    queryFn: categoriasSvc.getAll,
  })

/** Un gasto cambia el Balance, así que también se refrescan Dashboard y Configuración. */
const useInvalidarGastos = () => {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: [KEY] })
    qc.invalidateQueries({ queryKey: ["dashboard"] })
    qc.invalidateQueries({ queryKey: ["configuracion"] })
  }
}

export const useCreateGasto = () => {
  const invalidar = useInvalidarGastos()
  return useMutation({
    mutationFn: (data: GastoRequest) => gastosSvc.create(data),
    onSuccess: invalidar,
  })
}

export const useUpdateGasto = () => {
  const invalidar = useInvalidarGastos()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GastoRequest }) => gastosSvc.update(id, data),
    onSuccess: invalidar,
  })
}

export const useDeleteGasto = () => {
  const invalidar = useInvalidarGastos()
  return useMutation({
    mutationFn: (id: string) => gastosSvc.remove(id),
    onSuccess: invalidar,
  })
}

export const useCreateCategoriaGasto = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => categoriasSvc.create(nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIAS_KEY] }),
  })
}
