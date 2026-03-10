import { CheckCircle, Lock } from 'lucide-react'

interface FundsCardProps {
  type: 'available' | 'locked'
  value: string
}

const config = {
  available: {
    label: 'Available Funds',
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  locked: {
    label: 'Locked Funds',
    icon: Lock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
}

export default function FundsCard({ type, value }: FundsCardProps) {
  const { label, icon: Icon, iconBg, iconColor } = config[type]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between flex-1">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
  )
}
