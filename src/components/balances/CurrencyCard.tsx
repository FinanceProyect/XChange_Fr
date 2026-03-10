interface CurrencyCardProps {
  symbol: string
  code: string
  name: string
  change: string
  changeUp: boolean
  value: string
  sub: string
  color: string
  textColor: string
}

export default function CurrencyCard({
  symbol, code, name, change, changeUp, value, sub, color, textColor,
}: CurrencyCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${color} ${textColor}`}>
            {symbol}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">{code}</p>
            <p className="text-xs text-gray-400 mt-0.5">{name}</p>
          </div>
        </div>
        <span className={`text-xs font-medium ${changeUp ? 'text-green-600' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}
