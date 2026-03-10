import { Filter, Upload } from 'lucide-react'

export default function BalanceFilters() {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>All Accounts</option>
          <option>Trading Account</option>
          <option>Savings Account</option>
          <option>Crypto Wallet</option>
          <option>Investment Account</option>
        </select>
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>All Currencies</option>
          <option>USD</option>
          <option>EUR</option>
          <option>BTC</option>
          <option>ETH</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
          <Filter size={13} />
          Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
          <Upload size={13} />
          Export
        </button>
      </div>
    </div>
  )
}
