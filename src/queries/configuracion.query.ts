import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, saveConfiguracion } from '../services/configuracion.service'

export const useConfiguracion = () => {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  })
}

export const useSaveConfiguracion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => saveConfiguracion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}
