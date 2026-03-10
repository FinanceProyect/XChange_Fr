import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { portfolioData } from '../../data/mockData'

export default function PortfolioChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Portfolio Overview</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={portfolioData}
            cx="40%"
            cy="50%"
            innerRadius={0}
            outerRadius={85}
            dataKey="value"
            label={false}
            labelLine={false}
          >
            {portfolioData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="square"
            iconSize={10}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
