import { NavLink, useNavigate } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/auth'

const navLinks = [
  { label: 'Dashboard',   to: '/' },
  { label: 'Operaciones', to: '/operations' },
  { label: 'Deudores',    to: '/debtors' },
  { label: 'Acreedores',  to: '/creditors' },
  { label: 'Intercambios', to: '/exchanges' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout()
    queryClient.clear()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-8 py-2.5 flex items-center justify-between max-w-[1320px] mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">CJ</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">CambioJoyas</span>
      </div>

      {/* Nav links */}
      <ul className="flex items-center gap-1">
        {navLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Settings + logout */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `p-1.5 rounded-full transition-colors cursor-pointer ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
            }`
          }
        >
          <Settings size={19} />
        </NavLink>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={19} />
        </button>
      </div>
    </nav>
  )
}
