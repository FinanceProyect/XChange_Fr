import { apiClient } from "../api/client"

function extractToken(data: unknown): string {
  const d = data as Record<string, unknown>
  const token = d?.token ?? d?.access_token ?? d?.accessToken
  if (typeof token !== "string" || !token) throw new Error("Token inválido en la respuesta")
  return token
}

export async function loginRequest(credentials: unknown): Promise<string> {
  const response = await apiClient.post("/login", credentials)
  return extractToken(response.data)
}

export async function refreshRequest(): Promise<string> {
  const response = await apiClient.post("/refresh")
  return extractToken(response.data)
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/logout")
}
