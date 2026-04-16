import type { Debtor } from '../data/mockData'

export interface BackendDeuda {
  id: string
  moneda: string
  montoPendiente: number
  estado: string
  fechaVencimiento: string
}

// Shape devuelta por el backend en GET /deudores y GET /deudores/{id}
export interface BackendDeudor {
  id: string
  nombre: string
  fecha: string
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

export function deudorToFrontend(deudor: BackendDeudor): Debtor {
  // Tomar la primera deuda activa (no saldada ni cerrada)
  const activeDeuda =
    deudor.deudas.find((d) => {
      const s = d.estado.toUpperCase()
      return s !== 'SALDADO' && s !== 'CERRADO'
    }) ?? deudor.deudas[0]

  const montoPendiente = activeDeuda?.montoPendiente ?? 0
  const moneda = activeDeuda?.moneda ?? ''

  // Determinar estado global: si todas las deudas están saldadas → Paid
  let status: Debtor['status'] = 'Pending'
  if (deudor.deudas.length === 0) {
    status = 'Pending'
  } else if (deudor.deudas.every((d) => {
    const s = d.estado.toUpperCase()
    return s === 'SALDADO' || s === 'CERRADO'
  })) {
    status = 'Paid'
  } else if (activeDeuda) {
    status = mapEstado(activeDeuda.estado)
  }

  return {
    id:     deudor.id,
    name:   deudor.nombre,
    avatar: buildAvatar(deudor.nombre),
    date:   deudor.fecha,
    amount: String(montoPendiente),
    status,
    moneda,
  }
}
