import { useState } from 'react'

export default function TradeForm() {
  const [side, setSide]           = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [amount, setAmount]       = useState('0.00')

  const quickAmounts = ['25%', '50%', '75%', '100%']

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Buy / Sell toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
            side === 'buy' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
            side === 'sell' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Vender
        </button>
      </div>

      {/* Order type */}
      <p className="text-xs text-gray-500 mb-1.5">Tipo de orden</p>
      <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
        {(['market', 'limit'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1.5 text-sm font-medium capitalize transition-colors cursor-pointer ${
              orderType === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'market' ? 'Mercado' : 'Límite'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <p className="text-xs text-gray-500 mb-1.5">Cantidad</p>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden mb-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
        />
        <span className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200">BTC</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {quickAmounts.map((q) => (
          <button
            key={q}
            className="py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 cursor-pointer transition-colors text-gray-600"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Total */}
      <p className="text-xs text-gray-500 mb-1.5">Total</p>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden mb-4">
        <input
          type="number"
          defaultValue="0.00"
          className="flex-1 px-3 py-2 text-sm focus:outline-none"
        />
        <span className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200">USD</span>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1.5 text-xs mb-4">
        {[
          { label: 'Saldo disponible:',      value: '$8,450.00',  color: 'text-gray-800' },
          { label: 'Comisión (0,1%):',       value: '$4.36',      color: 'text-gray-800' },
          { label: 'Costo total est.:',      value: '$4,362.61',  color: 'text-gray-800' },
          { label: 'Saldo tras la operación:', value: '$4,087.39', color: 'text-gray-800' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors ${
          side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {side === 'buy' ? 'Colocar orden de compra' : 'Colocar orden de venta'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-2">
        Al colocar una orden, aceptás nuestros términos de trading
      </p>
    </div>
  )
}
