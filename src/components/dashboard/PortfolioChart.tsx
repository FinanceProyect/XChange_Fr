import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface PortfolioSeries {
  day: string
  EUR: number
  USD: number
  BRL: number
  USDT: number
}

interface CurrencyBalance {
  currency: string
  symbol: string
  amount: number
}

const currencies = [
  { key: 'EUR',  label: '€ EUR',  color: '#3b82f6' },
  { key: 'USD',  label: '$ USD',  color: '#22c55e' },
  { key: 'BRL',  label: 'R$ BRL', color: '#eab308' },
  { key: 'USDT', label: '₮ USDT', color: '#a855f7' },
]

interface PortfolioChartProps {
  portfolioSeries?: PortfolioSeries[]
  balances: CurrencyBalance[]
}

export default function PortfolioChart({ portfolioSeries, balances }: PortfolioChartProps) {
  const [active, setActive] = useState<Set<string>>(
    new Set(currencies.map((c) => c.key))
  )

  // Deduplica por día: si hay varias entradas para la misma fecha, se queda
  // con la última (el valor más reciente de ese día)
  const dedupedSeries: PortfolioSeries[] = portfolioSeries?.length
    ? Object.values(
        portfolioSeries.reduce<Record<string, PortfolioSeries>>((acc, point) => {
          acc[point.day] = point
          return acc
        }, {}),
      )
    : []

  // Si el backend devuelve la serie histórica la usamos; si no, construimos
  // un único punto "Hoy" a partir de los saldos actuales de los cards
  const chartData: PortfolioSeries[] = dedupedSeries.length
    ? dedupedSeries
    : balances.length
      ? [{
          day:  'Hoy',
          EUR:  balances.find((b) => b.currency === 'EUR')?.amount  ?? 0,
          USD:  balances.find((b) => b.currency === 'USD')?.amount  ?? 0,
          BRL:  balances.find((b) => b.currency === 'BRL')?.amount  ?? 0,
          USDT: balances.find((b) => b.currency === 'USDT')?.amount ?? 0,
        }]
      : []

  const toggle = (key: string) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (active.size === currencies.length) {
      setActive(new Set([currencies[0].key]))
    } else {
      setActive(new Set(currencies.map((c) => c.key)))
    }
  }

  const allActive = active.size === currencies.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      {/* Header + filtros */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-800">Portfolio Overview</h2>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={toggleAll}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors border ${
              allActive
                ? 'bg-gray-800 text-white border-gray-800'
                : 'text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          {currencies.map((c) => (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all border ${
                active.has(c.key) ? 'text-white' : 'text-gray-400 border-gray-200 hover:bg-gray-50'
              }`}
              style={active.has(c.key)
                ? { backgroundColor: c.color, borderColor: c.color }
                : {}
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = typeof value === 'number' ? value : 0
              const n = typeof name === 'string' ? name : ''
              const c = currencies.find((x) => x.key === n)
              return [`${c?.label.split(' ')[0]}${v.toLocaleString('es-ES')}`, n]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => currencies.find((c) => c.key === value)?.label ?? value}
          />
          {currencies.map((c) =>
            active.has(c.key) ? (
              <Line
                key={c.key}
                type="monotone"
                dataKey={c.key}
                stroke={c.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 5 }}
                name={c.key}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
