import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { portfolioChartData } from '../../data/mockData'

export default function PortfolioValueCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-semibold text-gray-800">Total Portfolio Value</p>
        <p className="text-xs text-gray-400">Last updated: 2 min ago</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-1">$24,580.00</p>
      <p className="text-xs text-green-600 mt-1">▲ +$1,247.50 (+5.34%) today</p>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={portfolioChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
