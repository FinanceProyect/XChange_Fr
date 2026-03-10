import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { monthlyTrendsData } from '../../data/mockData'

export default function MonthlyTrendsChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Monthly Trends</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={monthlyTrendsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v / 1000}k`}
            domain={[8000, 26000]}
          />
          <Tooltip formatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
          <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Balance" />
          <Line type="monotone" dataKey="debts"   stroke="#ef4444" strokeWidth={2} dot={false} name="Debts"   />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
