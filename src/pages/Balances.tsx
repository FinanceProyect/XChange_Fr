import Button from '../components/ui/Button'
import PortfolioValueCard from '../components/balances/PortfolioValueCard'
import FundsCard from '../components/balances/FundsCard'
import BalanceFilters from '../components/balances/BalanceFilters'
import CurrencyCard from '../components/balances/CurrencyCard'
import AccountDetailsTable from '../components/balances/AccountDetailsTable'
import RecentChanges from '../components/balances/RecentChanges'
import { currenciesData } from '../data/mockData'
import { PlusCircle, MinusCircle } from 'lucide-react'

export default function Balances() {
  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Account Balances</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Manage your funds across all accounts and currencies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button label="+ Deposit"  variant="primary"   icon={PlusCircle}  />
          <Button label="- Withdraw" variant="secondary" icon={MinusCircle} />
        </div>
      </div>

      {/* Portfolio value + funds cards */}
      <div className="flex flex-col lg:flex-row gap-4 mb-5">
        <div className="lg:flex-[2]">
          <PortfolioValueCard />
        </div>
        <div className="lg:flex-[1] flex flex-col gap-4">
          <FundsCard type="available" value="$18,420.00" />
          <FundsCard type="locked"    value="$6,160.00"  />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <BalanceFilters />
      </div>

      {/* Currency cards — 2 cols on portrait, 4 cols on landscape/12.9 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        {currenciesData.map((c) => (
          <CurrencyCard key={c.id} {...c} />
        ))}
      </div>

      {/* Account details + recent changes */}
      <div className="flex flex-col gap-4">
        <AccountDetailsTable />
        <RecentChanges />
      </div>
    </div>
  )
}
