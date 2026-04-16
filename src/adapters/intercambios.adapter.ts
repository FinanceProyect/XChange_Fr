export interface BackendIntercambio {
  id: string
  fechaHora: string
  activoEntrada: string
  montoEntrada: number
  activoSalida: string
  montoSalida: number
  tasaCambio: number
}

export interface Exchange {
  id: string
  fechaHora: string
  entradaCurrency: string
  entrada: number
  salidaCurrency: string
  salida: number
  tasaCambio: number
}

export function intercambioToFrontend(raw: BackendIntercambio): Exchange {
  return {
    id: raw.id,
    fechaHora: raw.fechaHora ?? '',
    entradaCurrency: raw.activoEntrada ?? '',
    entrada: Number(raw.montoEntrada ?? 0),
    salidaCurrency: raw.activoSalida ?? '',
    salida: Number(raw.montoSalida ?? 0),
    tasaCambio: Number(raw.tasaCambio ?? 0),
  }
}
