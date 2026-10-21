import { createContext } from "react"
import type { Sesion } from "../services/auth.service"

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  username: string | null
  role: string | null
  login: (sesion: Sesion) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
