export type DebtorStatus = 'Overdue' | 'Pending' | 'Paid'

export interface Debtor {
  id: string
  deudorId?: string
  date: string
  name: string
  avatar: string
  amount: string
  status: DebtorStatus
  moneda?: string
}

export interface BackendDeuda {
  id: string
  moneda: string
  montoPendiente: number
  fechaVencimiento: string
  fecha?: string
  estado: string
}

// Shape devuelta por el backend en GET /deudores
export interface BackendDeudor {
  id: string
  nombre: string
  deudas: BackendDeuda[]
}

function buildAvatar(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function mapEstado(estado: string): Debtor['status'] {
  const s = estado.toUpperCase()
  if (s === 'SALDADO' || s === 'CERRADO' || s === 'PAID' || s === 'PAGADO') return 'Paid'
  if (s === 'MORA' || s === 'OVERDUE' || s === 'VENCIDO') return 'Overdue'
  return 'Pending'
}

// Returns one row per deuda (same pattern as acreedorToFrontend)
export function deudorToFrontend(raw: BackendDeudor): Debtor[] {
  return raw.deudas.map((deuda) => ({
    id:       deuda.id,
    deudorId: raw.id,
    name:     raw.nombre ?? '',
    avatar:   buildAvatar(raw.nombre ?? ''),
    date:     deuda.fechaVencimiento ?? deuda.fecha ?? '',
    amount:   String(deuda.montoPendiente ?? 0),
    status:   mapEstado(deuda.estado),
    moneda:   deuda.moneda ?? '',
  }))
}
