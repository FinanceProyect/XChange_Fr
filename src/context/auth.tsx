import { useEffect, useRef, useState } from "react"
import { setTokenGetter, setRefreshCallback } from "../api/client"
import { refreshRequest, logoutRequest } from "../services/auth.service"
import { AuthContext } from "./authContext"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const tokenRef = useRef<string | null>(null)
  const initialized = useRef(false)

  // Keep tokenRef in sync for the interceptor getter (avoids stale closures)
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  // Register getter and refresh callback with the axios client
  useEffect(() => {
    setTokenGetter(() => tokenRef.current)
    setRefreshCallback(async () => {
      const newToken = await refreshRequest()
      setToken(newToken)
      tokenRef.current = newToken
      return newToken
    })
  }, [])

  // On mount: attempt refresh to restore session from the httpOnly cookie
  useEffect(() => {
    // Guard against React StrictMode double-invocation
    if (initialized.current) return
    initialized.current = true

    refreshRequest()
      .then((t) => setToken(t))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  function login(newToken: string) {
    setToken(newToken)
    tokenRef.current = newToken
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch {
      // Proceed with local logout even if backend call fails
    }
    setToken(null)
    tokenRef.current = null
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: token !== null, isLoading, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
