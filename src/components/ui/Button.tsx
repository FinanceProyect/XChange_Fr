import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'success' | 'secondary'
  icon?: LucideIcon
}

const variantStyles: Record<string, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  success:   'bg-green-600 hover:bg-green-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
}

export default function Button({ label, onClick, variant = 'primary', icon: Icon }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${variantStyles[variant]}`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  )
}
