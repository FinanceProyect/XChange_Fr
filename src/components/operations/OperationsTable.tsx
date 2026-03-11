import { useState } from 'react'
import type { OperationCurrency, OperationType } from '../../data/mockData'
import { operationsData } from '../../data/mockData'
import Pagination from '../ui/Pagination'

const currencySymbol: Record<OperationCurrency, string> = {
  EUR:  '€',
  USD:  '$',
  BRL:  'R$',
  USDT: '₮',
}

const currencyColors: Record<OperationCurrency, string> = {
  EUR:  'bg-blue-100 text-blue-700',
  USD:  'bg-green-100 text-green-700',
  BRL:  'bg-yellow-100 text-yellow-700',
  USDT: 'bg-purple-100 text-purple-700',
}

const typeColors: Record<OperationType, string> = {
  Compra: 'bg-green-100 text-green-700',
  Venta:  'bg-red-100 text-red-600',
}

const PAGE_SIZE = 7

interface OperationsTableProps {
  currency: OperationCurrency | ''
  type: OperationType | ''
}

export default function OperationsTable({ currency, type }: OperationsTableProps) {
  const [page, setPage] = useState(1)

  const filtered = operationsData.filter((op) => {
    const matchesCurrency = currency ? op.currency === currency : true
    const matchesType = type ? op.type === type : true
    return matchesCurrency && matchesType
  })

  const total = Math.ceil(filtered.length / PAGE_SIZE)
  const rows  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left py-2 font-medium">#</th>
            <th className="text-left py-2 font-medium">Fecha</th>
            <th className="text-left py-2 font-medium">Moneda</th>
            <th className="text-left py-2 font-medium">Tipo</th>
            <th className="text-right py-2 font-medium">Cantidad</th>
            <th className="text-right py-2 font-medium">Cotización</th>
            <th className="text-right py-2 font-medium">Beneficio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((op) => {
            const sym    = currencySymbol[op.currency]
            const profit = ((op.sellPrice - op.buyPrice) * op.amount).toFixed(2)
            const isUp   = parseFloat(profit) >= 0

            return (
              <tr key={op.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-400 text-xs">{op.id}</td>
                <td className="py-3 text-gray-600">{op.date}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${currencyColors[op.currency]}`}>
                    {sym} {op.currency}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[op.type]}`}>
                    {op.type}
                  </span>
                </td>
                <td className="py-3 text-right text-gray-700 font-medium">
                  {sym}{op.amount.toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-700">
                  {sym}{op.buyPrice.toFixed(4)}
                </td>
                <td className={`py-3 text-right font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                  {isUp ? '+' : ''}{sym}{profit}
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                No se encontraron operaciones
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          {filtered.length === 0
            ? 'Sin resultados'
            : `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} operaciones`}
        </p>
        <Pagination current={page} total={total} onPageChange={setPage} />
      </div>
    </div>
  )
}
