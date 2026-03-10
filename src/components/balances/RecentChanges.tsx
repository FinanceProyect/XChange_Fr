import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import type { ChangeType } from '../../data/mockData'
import type { LucideIcon } from 'lucide-react'
import { recentChangesData } from '../../data/mockData'

const typeConfig: Record<ChangeType, { icon: LucideIcon; iconBg: string; iconColor: string }> = {
  deposit:    { icon: ArrowDownCircle, iconBg: 'bg-green-100',  iconColor: 'text-green-600'  },
  withdrawal: { icon: ArrowUpCircle,   iconBg: 'bg-red-100',    iconColor: 'text-red-500'    },
  transfer:   { icon: RefreshCw,       iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
}

export default function RecentChanges() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Recent Balance Changes</h2>
        <p className="text-xs text-gray-500 mt-0.5">Latest deposits, withdrawals, and transfers</p>
      </div>

      <div className="flex flex-col gap-1">
        {recentChangesData.map((item) => {
          const { icon: Icon, iconBg, iconColor } = typeConfig[item.type]
          return (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${item.amountUp ? 'text-green-600' : 'text-red-500'}`}>
                  {item.amount}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.currency}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:underline cursor-pointer">
          View All Transactions →
        </button>
      </div>
    </div>
  )
}
