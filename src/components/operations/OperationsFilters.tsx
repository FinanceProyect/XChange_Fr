import type { OperationCurrency, OperationType } from '../../data/mockData'

interface OperationsFiltersProps {
  currency: OperationCurrency | ''
  type: OperationType | ''
  onCurrencyChange: (value: OperationCurrency | '') => void
  onTypeChange: (value: OperationType | '') => void
  onReset: () => void
}

export default function OperationsFilters({
  currency,
  type,
  onCurrencyChange,
  onTypeChange,
  onReset,
}: OperationsFiltersProps) {
  const hasFilters = currency !== '' || type !== ''

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as OperationCurrency | '')}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todas las monedas</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="BRL">BRL</option>
          <option value="USDT">USDT</option>
          <option value="METAL">METAL</option>
        </select>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as OperationType | '')}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Compra y Venta</option>
          <option value="Compra">Compra</option>
          <option value="Venta">Venta</option>
        </select>
      </div>
      <button
        onClick={onReset}
        disabled={!hasFilters}
        className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
          hasFilters
            ? 'border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer'
            : 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
        }`}
      >
        Limpiar filtros
      </button>
    </div>
  )
}
