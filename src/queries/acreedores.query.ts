import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '../services/acreedores.service'

const KEY = 'acreedores'

export const useAcreedores = (params?: unknown) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => svc.getAll(params) })

export const useCreateAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => svc.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useUpdateAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => svc.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const usePagarAcreedor = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, importe }: { id: string; importe: number }) => svc.pagar(id, importe),
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
