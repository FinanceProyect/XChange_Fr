import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  create,
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

export const useCreateOperacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operaciones"] })
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
    },
  })
}

export const useDeleteOperacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operaciones"] })
    },
  })
}
