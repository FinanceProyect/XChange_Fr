const fearGreedValue = 68

const stats = [
  { label: 'Global Market Cap', value: '$1.84T' },
  { label: 'BTC Dominance',     value: '46.4%'  },
  { label: '24h Volume',        value: '$82.5B' },
]

export default function MarketStats() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Market Stats</h2>

      {/* Fear & Greed Index */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Fear &amp; Greed Index</span>
          <span className="font-semibold text-orange-500">{fearGreedValue} - Greed</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500"
            style={{ width: `${fearGreedValue}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
