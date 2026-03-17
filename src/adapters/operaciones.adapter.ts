import type { Operation, OperationCurrency, OperationType } from '../data/mockData'

// Shape devuelta por el backend en /operaciones/compra y /operaciones/venta
export interface BackendOperacion {
  id: string
  fechaHora: string
  tipo: 'COMPRA' | 'VENTA'
  activoId: string
  monto: number
  tasaCambio: number
}

const tipoMap: Record<BackendOperacion['tipo'], OperationType> = {
  COMPRA: 'Compra',
  VENTA:  'Venta',
}

// activoId es el mismo código de moneda que usa el frontend
const activoIdToCurrency: Record<string, OperationCurrency> = {
  EUR:   'EUR',
  USD:   'USD',
  BRL:   'BRL',
  USDT:  'USDT',
  METAL: 'METAL',
}

export function operacionToFrontend(op: BackendOperacion): Operation {
  return {
    id:        op.id,
    date:      op.fechaHora.split('T')[0],
    currency:  activoIdToCurrency[op.activoId] ?? 'USD',
    type:      tipoMap[op.tipo],
    amount:    op.monto,
    buyPrice:  op.tasaCambio,
    sellPrice: op.tasaCambio,
  }
}
