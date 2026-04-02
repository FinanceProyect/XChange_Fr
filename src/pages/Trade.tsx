import { useState } from 'react'
import MarketTabs from '../components/trade/MarketTabs'
import PriceInfo from '../components/trade/PriceInfo'
import PriceChart from '../components/trade/PriceChart'
import OpenOrdersTable from '../components/trade/OpenOrdersTable'
import OpenPositionsTable from '../components/trade/OpenPositionsTable'
import TradeForm from '../components/trade/TradeForm'
import AccountSummary from '../components/trade/AccountSummary'
import MarketStats from '../components/trade/MarketStats'

export default function Trade() {
  const [activePair, setActivePair] = useState('btc-usd')

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Espacio de trading</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Compra y venta de activos con datos de mercado en tiempo real</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Mercado abierto
        </div>
      </div>

      {/* Market selector */}
      <div className="mb-4">
        <MarketTabs active={activePair} onChange={setActivePair} />
      </div>

      {/* Main layout: left (charts + tables) | right (form + summary) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4 lg:flex-[2]">
          <PriceInfo pair={activePair} />
          <PriceChart />
          <OpenOrdersTable />
          <OpenPositionsTable />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:flex-[1]">
          <TradeForm />
          <AccountSummary />
          <MarketStats />
        </div>
      </div>
    </div>
  )
}
