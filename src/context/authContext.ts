import { createContext } from "react"

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
