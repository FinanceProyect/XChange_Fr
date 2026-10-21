import { apiClient } from '../api/client'

export interface CotizacionBlue {
  compra: number
  venta: number
  fechaActualizacion: string
}

// 503 = API de cotizaciones caída: se acepta el status para que el interceptor no muestre un toast
// (es solo una referencia) y se rechaza acá para que la query quede en error.
export const getBlue = async (): Promise<CotizacionBlue> => {
  const response = await apiClient.get('cotizaciones/blue', {
    validateStatus: (status) => status === 200 || status === 503,
  })
  if (response.status !== 200) {
    throw new Error('Cotización blue no disponible')
  }
  return response.data
}
