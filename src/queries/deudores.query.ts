import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  create,
  getAll,
  getById,
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

export const useDeleteDeudor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores"] })
    },
  })
}
