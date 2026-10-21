import type { Currency } from './operation.types'

interface CurrencySelectProps {
  value: Currency
  onChange: (v: Currency) => void
  error?: string
  showError?: boolean
}

export default function CurrencySelect({ value, onChange, error, showError }: CurrencySelectProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as Currency)}
        className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Seleccionar moneda</option>
        <option value="EUR">€ Euro (EUR)</option>
        <option value="USD">$ Dólar (USD)</option>
        <option value="BRL">R$ Real Brasileño (BRL)</option>
        <option value="USDT">₮ Tether (USDT)</option>
        <option value="METAL">Oro</option>
      </select>
      {showError && error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
