import { apiClient } from "../api/client"

// Respuesta de /api/auth/login y /api/auth/refresh. El refresh token viaja en cookie httpOnly.
export interface Sesion {
  accessToken: string
  username: string
  role: string
}

export async function loginRequest(credentials: { username: string; password: string }): Promise<Sesion> {
  const response = await apiClient.post<Sesion>("auth/login", credentials)
  return response.data
}

export async function refreshRequest(): Promise<Sesion> {
  const response = await apiClient.post<Sesion>("auth/refresh")
  return response.data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("auth/logout")
}
