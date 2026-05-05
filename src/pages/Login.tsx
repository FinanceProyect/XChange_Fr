import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, TrendingUp, ArrowRightLeft, Gem } from 'lucide-react'
import { useAuth } from '../context/auth'
import { loginRequest } from '../services/auth.service'
import { showToast } from '../lib/toastBus'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = await loginRequest({ email, password, rememberMe })
      login(token)
      navigate('/')
    } catch {
      showToast({ message: 'Credenciales incorrectas. Verificá tu email y contraseña.', variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500 rounded-full opacity-50" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-700 rounded-full opacity-40" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-blue-500 rounded-full opacity-30" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-sm font-bold">CJ</span>
          </div>
          <span className="text-white font-semibold text-base tracking-wide">CambioJoyas Lourdes</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Gestión de cambio<br />y joyas en un solo lugar
            </h2>
            <p className="text-blue-100 text-sm mt-3 max-w-xs leading-relaxed">
              Control de operaciones, deudores, acreedores e intercambios de divisas de forma simple y eficiente.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: ArrowRightLeft, label: 'Intercambio de divisas en tiempo real' },
              { icon: TrendingUp,     label: 'Dashboard con resumen financiero'     },
              { icon: Gem,            label: 'Registro de operaciones con joyas'    },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <span className="text-blue-50 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-blue-200 text-xs">
          CambioJoyas Lourdes © {new Date().getFullYear()}
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-sm font-bold">CJ</span>
            </div>
            <span className="font-semibold text-gray-800">CambioJoyas Lourdes</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
            <p className="text-sm text-gray-500 mt-1">Inicia sesión para acceder al panel</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Correo electrónico
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                  <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-gray-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="flex-1 px-3 py-2.5 text-sm text-gray-700 focus:outline-none placeholder:text-gray-400 bg-white"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Contraseña
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                  <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-gray-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 px-3 py-2.5 text-sm text-gray-700 focus:outline-none placeholder:text-gray-400 bg-white"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm mt-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verificando…
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Acceso restringido · solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  )
}
