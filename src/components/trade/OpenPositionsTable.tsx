import { openPositionsData } from '../../data/mockData'

export default function OpenPositionsTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Open Positions</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left py-2 font-medium">Pair</th>
            <th className="text-left py-2 font-medium">Side</th>
            <th className="text-left py-2 font-medium">Entry Price</th>
            <th className="text-left py-2 font-medium">Current Price</th>
            <th className="text-left py-2 font-medium">Amount</th>
            <th className="text-left py-2 font-medium">P&L</th>
            <th className="text-left py-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {openPositionsData.map((pos) => (
            <tr key={pos.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 font-medium text-gray-800">{pos.pair}</td>
              <td className="py-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pos.side === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {pos.side}
                </span>
              </td>
              <td className="py-3 text-gray-700">{pos.entryPrice}</td>
              <td className="py-3 text-gray-700">{pos.currentPrice}</td>
              <td className="py-3 text-gray-700">{pos.amount}</td>
              <td className={`py-3 font-semibold ${pos.pnlUp ? 'text-green-600' : 'text-red-500'}`}>
                {pos.pnl}
              </td>
              <td className="py-3">
                <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded cursor-pointer transition-colors">
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
