import axios from "axios"
import { showToast } from "../lib/toastBus"

export const apiClient = axios.create({
  baseURL: "/api/",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Registered from AuthProvider to avoid circular imports
let _getToken: (() => string | null) | null = null
let _doRefresh: (() => Promise<string>) | null = null

export function setTokenGetter(fn: () => string | null) {
  _getToken = fn
}

export function setRefreshCallback(fn: () => Promise<string>) {
  _doRefresh = fn
}

apiClient.interceptors.request.use((config) => {
  const token = _getToken?.()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Queue for concurrent requests that arrive while a refresh is in progress
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401: attempt token refresh once (skip if already retried or is an auth call:
    // un 401 en login es credencial incorrecta, no sesión vencida)
    const esAuth = originalRequest.url?.includes("auth/login") || originalRequest.url?.includes("auth/refresh")
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !esAuth
    ) {
      originalRequest._retry = true

      if (!_doRefresh) {
        window.location.replace("/login")
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const newToken = await _doRefresh()
        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        refreshQueue = []
        window.location.replace("/login")
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // Show toast for all non-401 errors (401 is handled silently above).
    // El cambio de contraseña muestra su propio error inline en el modal.
    const errorInline = originalRequest.url?.includes("usuarios/me/password")
    if (error.response?.status !== 401 && !errorInline) {
      const message =
        error.response?.data?.message ??
        error.message ??
        "Ocurrió un error inesperado"
      showToast({ message, variant: "error" })
    }

    return Promise.reject(error)
  }
)
