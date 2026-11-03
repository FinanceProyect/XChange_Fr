import type { APIRequestContext } from '@playwright/test'

export const ADMIN_USER = 'admin'
export const ADMIN_PASSWORD = process.env.CYP_ADMIN_PASSWORD ?? 'admin-test-123'

// El backend limita los intentos de login (10 por minuto). Un solo login por run, cacheado en el worker.
let tokenPromise: Promise<string> | null = null

/** Access token del admin inicial (el backend debe haberlo creado con ADMIN_PASSWORD). */
export function getToken(request: APIRequestContext): Promise<string> {
  if (!tokenPromise) {
    tokenPromise = (async () => {
      const res = await request.post('http://localhost:8080/api/auth/login', {
        data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
      })
      if (!res.ok()) throw new Error(`Login API falló: ${res.status()} ${await res.text()}`)
      return ((await res.json()) as { accessToken: string }).accessToken
    })()
    tokenPromise.catch(() => { tokenPromise = null })
  }
  return tokenPromise
}

export interface IntercambioPayload {
  activoEntrada: string
  montoEntrada: number
  activoSalida: string
  cotizacion: number
}

export async function registrarIntercambio(request: APIRequestContext, token: string, payload: IntercambioPayload) {
  return request.post('http://localhost:8080/api/intercambios', {
    data: payload,
    headers: { Authorization: `Bearer ${token}` },
  })
}
