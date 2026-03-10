import { Wallet, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  wallet:           Wallet,
  'alert-triangle': AlertTriangle,
  clock:            Clock,
  'trending-up':    TrendingUp,
}

interface StatsCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean
  icon: string
  iconBg: string
  iconColor: string
}

export default function StatsCard({ title, value, trend, trendUp, icon, iconBg, iconColor }: StatsCardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>
    </div>
  )
}
