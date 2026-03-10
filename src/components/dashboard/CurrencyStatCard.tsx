interface CurrencyStatCardProps {
  currency: string
  symbol: string
  amount: number
}

const colorMap: Record<string, { bg: string; border: string; title: string; value: string; badge: string; badgeText: string }> = {
  EUR:  { bg: 'bg-blue-50/60',   border: 'border-blue-100',   title: 'text-blue-400',   value: 'text-blue-800',   badge: 'bg-blue-100',   badgeText: 'text-blue-600'   },
  USD:  { bg: 'bg-green-50/60',  border: 'border-green-100',  title: 'text-green-400',  value: 'text-green-800',  badge: 'bg-green-100',  badgeText: 'text-green-600'  },
  BRL:  { bg: 'bg-yellow-50/60', border: 'border-yellow-100', title: 'text-yellow-500', value: 'text-yellow-800', badge: 'bg-yellow-100', badgeText: 'text-yellow-600' },
  USDT: { bg: 'bg-purple-50/60', border: 'border-purple-100', title: 'text-purple-400', value: 'text-purple-800', badge: 'bg-purple-100', badgeText: 'text-purple-600' },
}

const fallback = { bg: 'bg-gray-50', border: 'border-gray-100', title: 'text-gray-400', value: 'text-gray-800', badge: 'bg-gray-100', badgeText: 'text-gray-600' }

export default function CurrencyStatCard({ currency, symbol, amount }: CurrencyStatCardProps) {
  const c = colorMap[currency] ?? fallback

  return (
    <div className={`rounded-xl border p-4 flex items-start justify-between ${c.bg} ${c.border}`}>
      <div>
        <p className={`text-xs font-medium mb-1 ${c.title}`}>{currency}</p>
        <p className={`text-2xl font-bold ${c.value}`}>
          {symbol}{amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${c.badge} ${c.badgeText}`}>
        {symbol}
      </div>
    </div>
  )
}
