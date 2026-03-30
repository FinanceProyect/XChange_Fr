import { useState, useEffect } from 'react'
import type { OperationCurrency, OperationType } from '../../data/mockData'
import { useOperaciones } from '../../queries/operaciones.query'
import { operacionToFrontend, type BackendOperacion } from '../../adapters/operaciones.adapter'
import Pagination from '../ui/Pagination'
import { formatDateValue, formatTimeValue } from '../../utils/date'

const currencySymbol: Record<OperationCurrency, string> = {
  EUR:   '€',
  USD:   '$',
  BRL:   'R$',
  USDT:  '₮',
  METAL: 'g',
}

const currencyColors: Record<OperationCurrency, string> = {
  EUR:   'bg-blue-100 text-blue-700',
  USD:   'bg-green-100 text-green-700',
  BRL:   'bg-yellow-100 text-yellow-700',
  USDT:  'bg-purple-100 text-purple-700',
  METAL: 'bg-amber-100 text-amber-700',
}

const typeColors: Record<OperationType, string> = {
  Compra: 'bg-green-100 text-green-700',
  Venta:  'bg-red-100 text-red-600',
}

const PAGE_SIZE = 8

interface OperationsTableProps {
  currency: OperationCurrency | ''
  type: OperationType | ''
}

export default function OperationsTable({ currency, type }: OperationsTableProps) {
  const [page, setPage] = useState(1)

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [currency, type])

  const params: Record<string, unknown> = { page: page - 1, size: PAGE_SIZE }
  if (currency) params.currency = currency
  if (type)     params.tipo     = type === 'Compra' ? 'COMPRA' : 'VENTA'

  const { data, isLoading } = useOperaciones(params)

  const response = data as { content: BackendOperacion[]; totalPages: number; totalElements: number } | undefined
  const rows         = (response?.content ?? []).map(operacionToFrontend)
  const totalPages   = response?.totalPages   ?? 1
  const totalElements = response?.totalElements ?? 0
  const emptyRows    = Math.max(0, PAGE_SIZE - rows.length)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
      )}

      {!isLoading && (
        <>
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/6" />
              <col className="w-1/6" />
              <col className="w-1/6" />
              <col className="w-1/6" />
              <col className="w-1/6" />
              <col className="w-1/6" />
            </colgroup>
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium">Fecha</th>
                <th className="text-left py-2 px-3 font-medium">Hora</th>
                <th className="text-left py-2 px-3 font-medium">Moneda</th>
                <th className="text-left py-2 px-3 font-medium">Tipo</th>
                <th className="text-right py-2 px-3 font-medium">Cantidad</th>
                <th className="text-right py-2 px-3 font-medium">Cotización</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((op) => {
                const sym      = currencySymbol[op.currency]
                const isMetal  = op.currency === 'METAL'

                return (
                  <tr key={op.id} className="h-14 align-middle border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-600">
                      {formatDateValue(op.dateTime ?? op.date)}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {formatTimeValue(op.dateTime ?? op.date)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${currencyColors[op.currency]}`}>
                        {isMetal ? '' : `${sym} `}{op.currency}
                        {op.quilataje ? ` ${op.quilataje}` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[op.type]}`}>
                        {op.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700 font-medium">
                      {isMetal
                        ? `${(op.peso ?? op.amount).toLocaleString()} g`
                        : `${sym}${op.amount.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {isMetal ? '' : sym}{op.buyPrice.toFixed(4)}
                    </td>
                  </tr>
                )
              })}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                <tr
                  key={`placeholder-${index}`}
                  className="h-14 align-middle border-b border-gray-50"
                  aria-hidden
                >
                  <td colSpan={6} className="py-3 px-3">
                    <span className="opacity-0">placeholder</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              No se encontraron operaciones
            </p>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              {totalElements === 0
                ? 'Sin resultados'
                : `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalElements)} de ${totalElements} operaciones`}
            </p>
            <Pagination current={page} total={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}
