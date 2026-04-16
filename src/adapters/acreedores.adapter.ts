export interface BackendSaldo {
  id: string
  codigoDivisa: string
  monto: number
  fechaOperacion: string
  tipoOperacion: string
}

// Shape devuelta por el backend en GET /acreedores y GET /acreedores/{id}
export interface BackendAcreedor {
  id: string
  nombre: string
  fechaVencimiento: string | null
  estado: string
  saldos: BackendSaldo[]
}

export interface Creditor {
  id: string        // UUID del acreedor (necesario para el endpoint pagar)
  name: string
  currency: string
  amount: number
  dueDate: string
  status: 'Pending' | 'Paid'
}

// Devuelve una fila por cada saldo del acreedor
export function acreedorToFrontend(raw: BackendAcreedor): Creditor[] {
  const acreedorPagado = raw.estado.toUpperCase() === 'PAGADO'

  return raw.saldos.map((saldo) => ({
    id: raw.id,
    name: raw.nombre ?? '',
    currency: saldo.codigoDivisa ?? '',
    amount: Number(saldo.monto ?? 0),
    dueDate: raw.fechaVencimiento ?? '',
    status: acreedorPagado || saldo.monto === 0 ? 'Paid' : 'Pending',
  }))
}
