import { useState } from 'react'
import Pagination from '../ui/Pagination'
import EditExchangeModal from './EditExchangeModal'
import { useIntercambios } from '../../queries/intercambios.query'
import {
  intercambioToFrontend,
  type BackendIntercambio,
  type Exchange,
} from '../../adapters/intercambios.adapter'

export type { Exchange }

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  BRL: 'R$',
  USDT: '₮',
  ARS: '$',
  METAL: '',
}

const CURRENCY_COLORS: Record<string, string> = {
  ARS: '#E24B4A',
  USD: '#1D9E75',
  EUR: '#378ADD',
  USDT: '#639922',
  BRL: '#BA7517',
}

const PAGE_SIZE = 6

export default function ExchangesTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [editing, setEditing] = useState<Exchange | null>(null)


  const { data, isLoading } = useIntercambios()
  const exchanges: Exchange[] = (Array.isArray(data) ? (data as BackendIntercambio[]) : []).map(
    intercambioToFrontend,
  )

  const totalPages = Math.ceil(exchanges.length / PAGE_SIZE)
  const paginated = exchanges.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const emptyRows = Math.max(0, PAGE_SIZE - paginated.length)

  const formatAmount = (amount: number, currency: string) => {
    const sym = CURRENCY_SYMBOLS[currency] ?? ''
    return `${sym}${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
        )}

        {!isLoading && (
          <>
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[33%]" />
                <col className="w-[33%]" />
                <col className="w-[34%]" />
              </colgroup>
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Entrada</th>
                  <th className="text-left py-2 font-medium">Salida</th>
                  <th className="text-left py-2 font-medium">Tasa de cambio</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((exchange) => (
                  <tr
                    key={exchange.id}
                    onClick={() => setEditing(exchange)}
                    className="h-14 align-middle border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {formatAmount(exchange.entrada, exchange.entradaCurrency)}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: CURRENCY_COLORS[exchange.entradaCurrency] ?? '#94A3B8' }}
                        >
                          {exchange.entradaCurrency}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {formatAmount(exchange.salida, exchange.salidaCurrency)}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: CURRENCY_COLORS[exchange.salidaCurrency] ?? '#94A3B8' }}
                        >
                          {exchange.salidaCurrency}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-gray-700">
                        {exchange.tasaCambio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 ? (
                  <tr aria-hidden>
                    <td colSpan={3} className="h-[336px] text-center align-middle text-sm text-gray-400">
                      No se encontraron resultados
                    </td>
                  </tr>
                ) : (
                  emptyRows > 0 &&
                  Array.from({ length: emptyRows }).map((_, i) => (
                    <tr
                      key={`placeholder-${i}`}
                      className="h-14 align-middle border-b border-gray-50"
                      aria-hidden
                    >
                      <td className="py-3" colSpan={3}>
                        <span className="opacity-0">placeholder</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                {exchanges.length === 0
                  ? 'Sin resultados'
                  : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, exchanges.length)} de ${exchanges.length} resultados`}
              </p>
              <Pagination
                current={currentPage}
                total={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditExchangeModal
          exchange={editing}
          onClose={() => setEditing(null)}
          onSave={() => setEditing(null)}
        />
      )}
    </>
  )
}
