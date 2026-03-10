import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { operationsData } from '../../data/mockData'
import type { OperationCurrency } from '../../data/mockData'

const currencySymbol: Record<OperationCurrency, string> = {
  EUR:  '€',
  USD:  '$',
  BRL:  'R$',
  USDT: '₮',
}

const currencyColors: Record<OperationCurrency, string> = {
  EUR:  'bg-blue-100 text-blue-700',
  USD:  'bg-green-100 text-green-700',
  BRL:  'bg-yellow-100 text-yellow-700',
  USDT: 'bg-purple-100 text-purple-700',
}

const RECENT_LIMIT = 6

export default function RecentOperations() {
  const recent = operationsData.slice(0, RECENT_LIMIT)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Últimas operaciones</h2>
        <Link
          to="/operations"
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Ver todas →
        </Link>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {recent.map((op) => {
          const sym    = currencySymbol[op.currency]
          const profit = ((op.sellPrice - op.buyPrice) * op.amount).toFixed(2)
          const isUp   = parseFloat(profit) >= 0

          return (
            <div key={op.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  op.type === 'Compra' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {op.type === 'Compra'
                    ? <ArrowDownLeft size={14} className="text-green-600" />
                    : <ArrowUpRight  size={14} className="text-red-500"   />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-800">{op.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${currencyColors[op.currency]}`}>
                      {sym}{op.currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{op.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-800">{sym}{op.amount.toLocaleString()}</p>
                <p className={`text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                  {isUp ? '+' : ''}{sym}{profit}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
