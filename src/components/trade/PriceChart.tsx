import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { priceChartData } from '../../data/mockData'

const timeFilters = ['1H', '4H', '1D', '1W', '1M']

export default function PriceChart() {
  const [active, setActive] = useState('1D')
  const data = priceChartData[active] ?? priceChartData['1D']

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Price Chart</h2>
        <div className="flex items-center gap-1">
          {timeFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                active === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} width={35} />
          <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
          <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fill="url(#priceGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
