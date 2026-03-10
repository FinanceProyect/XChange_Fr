import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'

const navLinks = [
  { label: 'Dashboard',  to: '/' },
  { label: 'Balances',   to: '/balances' },
  { label: 'Trade',      to: '/trade' },
  { label: 'Analytics',  to: '/analytics' },
  { label: 'History',    to: '/history' },
  { label: 'Settings',   to: '/settings' },
]

export default function Navbar() {
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-full hover:bg-gray-100 cursor-pointer">
          <Bell size={18} className="text-gray-600" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
          <img
            src="https://i.pravatar.cc/32"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  )
}
