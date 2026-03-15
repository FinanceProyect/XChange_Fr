import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  create,
  generarDeuda,
  getAll,
  getById,
  remove,
  update,
} from "../services/operaciones.service"

export const useOperaciones = (params?: unknown) => {
  return useQuery({
    queryKey: ["operaciones", params],
    queryFn: () => getAll(params),
  })
}

export const useOperacion = (id: string) => {
  return useQuery({
    queryKey: ["operaciones", id],
    queryFn: () => getById(id),
    enabled: !!id,
  })
}

const invalidateDashboard = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] })

interface DashboardStatsCache {
  currencyBalances?: Array<{
    currency: string
    amount: number
    [key: string]: unknown
  }>
  [key: string]: unknown
}

interface OperacionPayload {
  tipo?: string
  activoId?: string
  monto?: number
}

const updateDashboardBalancesCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  payload?: OperacionPayload,
) => {
  if (!payload?.activoId || typeof payload.monto !== "number" || Number.isNaN(payload.monto)) {
    return
  }

  const normalizedType = payload.tipo?.toUpperCase()
  const delta = normalizedType === "VENTA" ? -payload.monto : payload.monto

  queryClient.setQueryData<DashboardStatsCache | undefined>(
    ["dashboard", "stats"],
    (prev) => {
      if (!prev?.currencyBalances) return prev

      let didUpdate = false
      const currencyBalances = prev.currencyBalances.map((balance) => {
        if (balance.currency !== payload.activoId) return balance

        didUpdate = true
        const currentAmount = typeof balance.amount === "number" ? balance.amount : Number(balance.amount ?? 0)
        const nextAmount = Math.max(currentAmount + delta, 0)
        return { ...balance, amount: nextAmount }
      })

      if (!didUpdate) return prev
      return { ...prev, currencyBalances }
    },
  )
}

export const useCreateOperacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => create(data),
    onSuccess: (_result, variables) => {
      updateDashboardBalancesCache(queryClient, variables as OperacionPayload)
      queryClient.invalidateQueries({ queryKey: ["operaciones"] })
      invalidateDashboard(queryClient)
    },
  })
}

export const useUpdateOperacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operaciones"] })
      invalidateDashboard(queryClient)
    },
  })
}

export const useDeleteOperacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operaciones"] })
      invalidateDashboard(queryClient)
    },
  })
}

export const useGenerarDeuda = () => {
  return useMutation({
    mutationFn: ({ operacionId, deudorId }: { operacionId: string; deudorId: string }) =>
      generarDeuda(operacionId, deudorId),
  })
}
