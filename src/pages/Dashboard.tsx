import StatsCard from '../components/dashboard/StatsCard'
import CurrencyStatCard from '../components/dashboard/CurrencyStatCard'
import PortfolioChart from '../components/dashboard/PortfolioChart'
import RecentOperations from '../components/dashboard/RecentOperations'
import { totalBalanceCard, currencyBalances } from '../data/mockData'

export default function Dashboard() {
  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Total Balance + monedas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-5">
        <StatsCard {...totalBalanceCard} />
        {currencyBalances.map((b) => (
          <CurrencyStatCard key={b.currency} {...b} />
        ))}
      </div>

      {/* Portfolio chart + últimas operaciones */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="lg:flex-[3] flex flex-col">
          <PortfolioChart />
        </div>
        <div className="lg:flex-[2] flex flex-col">
          <RecentOperations />
        </div>
      </div>
    </div>
  )
}
