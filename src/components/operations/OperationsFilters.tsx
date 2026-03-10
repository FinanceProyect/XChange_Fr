import { Filter, Download } from 'lucide-react'

export default function OperationsFilters() {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>Todas las monedas</option>
          <option>EUR</option>
          <option>USD</option>
          <option>BRL</option>
          <option>USDT</option>
        </select>
        <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>Compra y Venta</option>
          <option>Compra</option>
          <option>Venta</option>
        </select>
        <input
          type="date"
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
          <Filter size={13} />
          Filtrar
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
          <Download size={13} />
          Exportar
        </button>
      </div>
    </div>
  )
}
