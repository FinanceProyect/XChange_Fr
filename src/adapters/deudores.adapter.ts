import type { Debtor } from '../data/mockData'

// Shape devuelta por el backend en /deudores
export interface BackendDeudor {
  id: string
  nombre: string
  documento: string
  fecha: string
  importe: number | null
}

function buildAvatar(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function deudorToFrontend(deudor: BackendDeudor): Debtor {
  return {
    id:     deudor.id,
    name:   deudor.nombre,
    avatar: buildAvatar(deudor.nombre),
    document: deudor.documento,
    date:   deudor.fecha,
    amount: deudor.importe === null || deudor.importe === undefined ? '' : String(deudor.importe),
    status: 'Pending',
  }
}
