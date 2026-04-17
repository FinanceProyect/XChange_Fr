export interface BackendSaldo {
  id: string
  codigoDivisa: string
  monto: number
  fechaOperacion: string
  tipoOperacion: string
  estado: string
}

// Shape devuelta por el backend en GET /acreedores y GET /acreedores/{id}
export interface BackendAcreedor {
  id: string
  nombre: string
  saldos: BackendSaldo[]
}

export interface Creditor {
  id: string      // UUID del acreedor (necesario para el endpoint pagar)
  saldoId: string // UUID del saldo (key único por fila)
  name: string
  currency: string
  amount: number
  dueDate: string
  status: 'Pending' | 'Paid'
}

// Devuelve una fila por cada saldo del acreedor
export function acreedorToFrontend(raw: BackendAcreedor): Creditor[] {
  return raw.saldos.map((saldo) => ({
    id: raw.id,
    saldoId: saldo.id,
    name: raw.nombre ?? '',
    currency: saldo.codigoDivisa ?? '',
    amount: Number(saldo.monto ?? 0),
    dueDate: saldo.fechaOperacion ?? '',
    status: saldo.estado.toUpperCase() === 'PAGADO' ? 'Paid' : 'Pending',
  }))
}
