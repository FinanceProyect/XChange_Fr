import { useState } from 'react'
import { Wallet, Globe, PiggyBank, LogOut, Save } from 'lucide-react'
import { currencyBalances } from '../data/mockData'

const currencyLabels: Record<string, string> = {
  EUR:  'Euros (EUR)',
  USD:  'Dólares (USD)',
  BRL:  'Reales Brasileños (BRL)',
  USDT: 'Tether (USDT)',
}

export default function Settings() {
  const [defaultCurrency, setDefaultCurrency] = useState('EUR')
  const [defaultWallet, setDefaultWallet]     = useState('Trading Account')
  const [language, setLanguage]               = useState('es')
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(currencyBalances.map((b) => [b.currency, b.amount.toString()]))
  )

  const handleBalance = (id: string, value: string) =>
    setBalances((prev) => ({ ...prev, [id]: value }))

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">

      {/* Header — título izquierda, botones derecha */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Ajusta las preferencias de tu cuenta</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            <Save size={14} />
            Guardar cambios
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main layout: izquierda saldo | derecha cartera + idioma */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Izquierda — Saldo disponible */}
        <div className="lg:flex-1 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PiggyBank size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">Saldo disponible</h2>
          </div>
          <div className="flex flex-col gap-3">
            {currencyBalances.map(({ currency, symbol }) => (
              <div key={currency}>
                <label className="text-xs text-gray-500 mb-1 block">{currencyLabels[currency]}</label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                  <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 min-w-[40px] text-center">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={balances[currency]}
                    onChange={(e) => handleBalance(currency, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derecha — Cartera + Idioma */}
        <div className="lg:flex-1 flex flex-col gap-4">

          {/* Cartera por defecto */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-800">Cartera por defecto</h2>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cuenta principal</label>
                <select
                  value={defaultWallet}
                  onChange={(e) => setDefaultWallet(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option>Trading Account</option>
                  <option>Savings Account</option>
                  <option>Crypto Wallet</option>
                  <option>Investment Account</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Moneda por defecto</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="USD">$ Dólar (USD)</option>
                  <option value="BRL">R$ Real Brasileño (BRL)</option>
                  <option value="USDT">₮ Tether (USDT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Idioma */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-800">Idioma</h2>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  )
}
