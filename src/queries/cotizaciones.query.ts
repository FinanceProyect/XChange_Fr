import { useQuery } from '@tanstack/react-query'
import { getBlue } from '../services/cotizaciones.service'

const FIVE_MIN_MS = 5 * 60 * 1000

export const useCotizacionBlue = (enabled = true) =>
  useQuery({
    queryKey: ['cotizaciones', 'blue'],
    queryFn: getBlue,
    staleTime: FIVE_MIN_MS,
    retry: false,
    enabled,
  })
