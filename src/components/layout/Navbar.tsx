import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import UserMenu from './UserMenu'
import { useAuth } from '../../context/useAuth'

const navLinks = [
  { label: 'Dashboard',   to: '/',            adminOnly: false },
  { label: 'Operaciones', to: '/operations',  adminOnly: false },
  { label: 'Deudores',    to: '/debtors',     adminOnly: false },
  { label: 'Acreedores',  to: '/creditors',   adminOnly: false },
  { label: 'Gastos',      to: '/expenses',    adminOnly: true },
]

export default function Navbar() {
  const { role } = useAuth()
  const linksVisibles = navLinks.filter((link) => !link.adminOnly || role === 'ADMIN')

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
        {linksVisibles.map((link) => (
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

      {/* Settings + user menu */}
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
        <UserMenu />
      </div>
    </nav>
  )
}
