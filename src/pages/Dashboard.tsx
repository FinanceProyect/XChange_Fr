import StatsCard from '../components/dashboard/StatsCard'
import PortfolioChart from '../components/dashboard/PortfolioChart'
import MonthlyTrendsChart from '../components/dashboard/MonthlyTrendsChart'
import DebtorsTable from '../components/dashboard/DebtorsTable'
import { statsData } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats cards — 2 cols on iPad 11 portrait, 4 cols on 12.9 portrait + both landscapes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        {statsData.map((stat) => (
          <StatsCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Charts — stacked on iPad 11 portrait, side by side on 1024px+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <PortfolioChart />
        <MonthlyTrendsChart />
      </div>

      {/* Debtors table */}
      <DebtorsTable />
    </div>
  )
}
