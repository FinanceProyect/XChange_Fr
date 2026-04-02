import { useState } from 'react'
import { Search } from 'lucide-react'
import { marketTabs } from '../../data/mockData'

interface MarketTabsProps {
  active: string
  onChange: (id: string) => void
}

export default function MarketTabs({ active, onChange }: MarketTabsProps) {
  const [search, setSearch] = useState('')

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
      <div className="flex items-center gap-1 flex-1">
        {marketTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              active === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button className="px-4 py-1.5 rounded-md text-sm text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors">
          Más
        </button>
      </div>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar mercados..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
        />
      </div>
    </div>
  )
}
