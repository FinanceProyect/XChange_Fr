import type { Debtor } from '../data/mockData'

// Shape devuelta por el backend en GET /deudores (array plano de deudas)
export interface BackendDeudor {
  id: string
  deudorId: string
  nombreDeudor: string
  nombreDivisa: string
  monto: number
  fecha: string
  estado: string
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

export function deudorToFrontend(raw: BackendDeudor): Debtor {
  return {
    id:     raw.id,
    name:   raw.nombreDeudor ?? '',
    avatar: buildAvatar(raw.nombreDeudor ?? ''),
    date:   raw.fecha ?? '',
    amount: String(raw.monto ?? 0),
    status: mapEstado(raw.estado),
    moneda: raw.nombreDivisa ?? '',
  }
}
