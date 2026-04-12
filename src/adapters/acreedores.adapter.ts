export interface BackendAcreedor {
  id: string
  nombre: string
  moneda: string
  importe: number
  fechaVencimiento: string
  estado: string
}

export interface Creditor {
  id: string
  name: string
  currency: string
  amount: number
  dueDate: string
  status: 'Pending' | 'Paid'
}

export function acreedorToFrontend(raw: BackendAcreedor): Creditor {
  const estado = (raw.estado ?? '').toString().toUpperCase()
  return {
    id: raw.id,
    name: raw.nombre ?? '',
    currency: raw.moneda ?? '',
    amount: Number(raw.importe ?? 0),
    dueDate: raw.fechaVencimiento ?? '',
    status: estado === 'PAGADO' || estado === 'PAID' ? 'Paid' : 'Pending',
  }
}
