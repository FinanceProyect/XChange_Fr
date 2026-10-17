import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as svc from '../services/intercambios.service'
import type { RegistrarIntercambioPayload } from '../services/intercambios.service'
import type { BackendIntercambio } from '../adapters/intercambios.adapter'

const KEY = 'intercambios'

export const useIntercambios = (params?: unknown) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => svc.getAll(params) })

export const useCreateIntercambio = () => {
  const qc = useQueryClient()
  return useMutation<BackendIntercambio, unknown, RegistrarIntercambioPayload>({
    mutationFn: (data) => svc.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['operaciones'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
