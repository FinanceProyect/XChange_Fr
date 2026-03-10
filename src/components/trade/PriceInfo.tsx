interface PriceInfoProps {
  pair: string
}

const pairData: Record<string, {
  change: string; price: string; delta: string
  high: string; low: string; volume: string; cap: string
}> = {
  'btc-usd': { change: '+5.24%', price: '$43,582.50', delta: '+$2,167.30', high: '$44,120.00', low: '$41,230.00', volume: '28.5K BTC', cap: '$854B' },
  'eth-usd': { change: '+3.70%', price: '$2,310.00',  delta: '+$82.40',    high: '$2,350.00',  low: '$2,210.00',  volume: '120K ETH', cap: '$278B' },
  'eur-usd': { change: '-0.80%', price: '$1.0842',    delta: '-$0.0088',   high: '$1.0930',    low: '$1.0800',    volume: '5.2B',     cap: 'N/A'   },
}

export default function PriceInfo({ pair }: PriceInfoProps) {
  const data = pairData[pair] ?? pairData['btc-usd']
  const label = pair.replace('-', '/').toUpperCase()
  const isUp = data.change.startsWith('+')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-bold text-gray-900">{label}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {data.change}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{data.price}</span>
            <span className={`text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>{data.delta}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500">
          <div><span className="text-gray-400">24h High</span><p className="text-gray-800 font-medium">{data.high}</p></div>
          <div><span className="text-gray-400">24h Low</span><p className="text-gray-800 font-medium">{data.low}</p></div>
          <div><span className="text-gray-400">24h Volume</span><p className="text-gray-800 font-medium">{data.volume}</p></div>
          <div><span className="text-gray-400">Market Cap</span><p className="text-gray-800 font-medium">{data.cap}</p></div>
        </div>
      </div>
    </div>
  )
}
