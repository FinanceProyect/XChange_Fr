import { useEffect, useRef, useState } from "react"
import { setTokenGetter, setRefreshCallback } from "../api/client"
import { refreshRequest, logoutRequest, type Sesion } from "../services/auth.service"
import { AuthContext } from "./authContext"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Sesion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const tokenRef = useRef<string | null>(null)
  const initialized = useRef(false)

  // Keep tokenRef in sync for the interceptor getter (avoids stale closures)
  useEffect(() => {
    tokenRef.current = session?.accessToken ?? null
  }, [session])

  // Register getter and refresh callback with the axios client
  useEffect(() => {
    setTokenGetter(() => tokenRef.current)
    setRefreshCallback(async () => {
      const nueva = await refreshRequest()
      setSession(nueva)
      tokenRef.current = nueva.accessToken
      return nueva.accessToken
    })
  }, [])

  // On mount: attempt refresh to restore session from the httpOnly cookie
  useEffect(() => {
    // Guard against React StrictMode double-invocation
    if (initialized.current) return
    initialized.current = true

    refreshRequest()
      .then((s) => setSession(s))
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false))
  }, [])

  function login(nueva: Sesion) {
    setSession(nueva)
    tokenRef.current = nueva.accessToken
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch {
      // Proceed with local logout even if backend call fails
    }
    setSession(null)
    tokenRef.current = null
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session !== null,
        isLoading,
        token: session?.accessToken ?? null,
        username: session?.username ?? null,
        role: session?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
