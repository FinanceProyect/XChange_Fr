import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '../services/acreedores.service'

const KEY = 'acreedores'

export const useAcreedores = (params?: unknown) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => svc.getAll(params) })

export const useAcreedoresPendientes = () =>
  useQuery({ queryKey: [KEY, 'pendientes'], queryFn: () => svc.getPendientes() })

export const useSugerenciasAcreedor = (nombre: string) =>
  useQuery({
    queryKey: [KEY, 'sugerencias', nombre],
    queryFn: () => svc.getSugerencias(nombre),
    enabled: nombre.trim().length > 0,
  })

export const useCreateAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => svc.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const usePagarAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; pagos: { codigoDivisa: string; monto: number }[] }) =>
      svc.pagar(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useDeleteAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
