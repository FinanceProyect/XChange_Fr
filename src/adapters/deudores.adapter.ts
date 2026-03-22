import type { Debtor } from '../data/mockData'

// Shape devuelta por el backend en /deudores
export interface BackendDeudor {
  id: string
  nombre: string
  documento: string
  fecha: string
  importe: number | null
  estado?: string
  state?: string
}

function buildAvatar(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function deudorToFrontend(deudor: BackendDeudor): Debtor {
  const rawStatus = (deudor.estado ?? deudor.state ?? '').toLowerCase()
  const normalizedStatus =
    rawStatus === 'paid' || rawStatus === 'pagado'
      ? 'Paid'
      : rawStatus === 'pending' || rawStatus === 'pendiente'
        ? 'Pending'
        : rawStatus === 'overdue' || rawStatus === 'vencido'
          ? 'Overdue'
          : 'Pending'

  return {
    id:     deudor.id,
    name:   deudor.nombre,
    avatar: buildAvatar(deudor.nombre),
    document: deudor.documento,
    date:   deudor.fecha,
    amount: deudor.importe === null || deudor.importe === undefined ? '' : String(deudor.importe),
    status: normalizedStatus,
  }
}
