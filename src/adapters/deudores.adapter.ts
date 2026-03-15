import type { Debtor, DebtorStatus } from '../data/mockData'

// Shapes devueltas por el backend
export interface BackendDeudor {
  id: string
  nombre: string
  documento: string
  deuda?: BackendDeuda | null
}

export interface BackendDeuda {
  id: string
  montoPendiente: number
  fechaVencimiento: string
  estadoActual: 'VIGENTE' | 'MORA' | 'SALDADO' | 'CERRADO'
  deudorId: string
}

const estadoMap: Record<BackendDeuda['estadoActual'], DebtorStatus> = {
  VIGENTE: 'Pending',
  MORA:    'Overdue',
  SALDADO: 'Paid',
  CERRADO: 'Paid',
}

function buildAvatar(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function deudorToFrontend(
  deudor: BackendDeudor,
  deuda?: BackendDeuda,
): Debtor {
  return {
    id:     deudor.id,
    name:   deudor.nombre,
    avatar: buildAvatar(deudor.nombre),
    date:   deuda?.fechaVencimiento ?? '',
    amount: deuda ? `$${deuda.montoPendiente.toFixed(2)}` : '',
    status: deuda ? estadoMap[deuda.estadoActual] : 'Pending',
  }
}
