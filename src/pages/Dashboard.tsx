import StatsCard from '../components/dashboard/StatsCard'
import CurrencyStatCard from '../components/dashboard/CurrencyStatCard'
import PortfolioChart from '../components/dashboard/PortfolioChart'
import RecentOperations from '../components/dashboard/RecentOperations'
import { totalBalanceCard, currencyBalances } from '../data/mockData'
import { useDashboardStats } from '../queries/dashboard.query'
import type { BackendOperacion } from '../adapters/operaciones.adapter'

interface DashboardStats {
  totalBalance: number
  totalBalanceTrend: string
  trendUp: boolean
  currencyBalances: { currency: string; symbol: string; amount: number }[]
  portfolioSeries?: { day: string; EUR: number; USD: number; BRL: number; USDT: number }[]
  recentOperations: BackendOperacion[]
}

export default function Dashboard() {
  const { data } = useDashboardStats()
  const stats = data as DashboardStats | undefined

  const balances = stats?.currencyBalances ?? currencyBalances

  const totalCard = stats
    ? {
        ...totalBalanceCard,
        value: `$${stats.totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: stats.totalBalanceTrend,
        trendUp: stats.trendUp,
      }
    : totalBalanceCard

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Total Balance + monedas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-5">
        <StatsCard {...totalCard} />
        {balances.map((b) => (
          <CurrencyStatCard key={b.currency} {...b} />
        ))}
      </div>

      {/* Portfolio chart + últimas operaciones */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="lg:flex-[3] flex flex-col">
          <PortfolioChart portfolioSeries={stats?.portfolioSeries} balances={balances} />
        </div>
        <div className="lg:flex-[2] flex flex-col">
          <RecentOperations operations={stats?.recentOperations} />
        </div>
      </div>
    </div>
  )
}
