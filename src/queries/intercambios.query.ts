import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '../services/intercambios.service'

const KEY = 'intercambios'

export const useIntercambios = (params?: unknown) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => svc.getAll(params) })

export const useCreateIntercambio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => svc.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useUpdateIntercambio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => svc.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export const useDeleteIntercambio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => svc.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
