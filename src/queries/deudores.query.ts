import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  agrandar,
  create,
  getAll,
  getById,
  getMovimientos,
  pagar,
  remove,
  update,
} from "../services/deudores.service"

export const useDeudores = (params?: unknown) => {
  return useQuery({
    queryKey: ["deudores", params],
    queryFn: () => getAll(params),
  })
}

export const useDeudor = (id: string) => {
  return useQuery({
    queryKey: ["deudores", id],
    queryFn: () => getById(id),
    enabled: !!id,
  })
}

export const useCreateDeudor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
    },
  })
}

export const useUpdateDeudor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
    },
  })
}

export const usePagarDeudor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; pagos: { moneda: string; monto: number }[] }) => pagar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
      queryClient.invalidateQueries({ queryKey: ["movimientosDeuda"] })
    },
  })
}

export const useAgrandarDeuda = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      deudorId,
      moneda,
      monto,
      motivo,
    }: {
      deudorId: string
      moneda: string
      monto: number
      motivo?: string
    }) => agrandar(deudorId, moneda, { monto, motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
      queryClient.invalidateQueries({ queryKey: ["movimientosDeuda"] })
    },
  })
}

export const useMovimientosDeuda = (deudorId: string, deudaId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["movimientosDeuda", deudorId, deudaId],
    queryFn: () => getMovimientos(deudorId, deudaId),
    enabled: enabled && !!deudorId && !!deudaId,
  })
}

export const useDeleteDeudor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
    },
  })
}
