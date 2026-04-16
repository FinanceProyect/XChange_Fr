import { useState } from 'react'
import { Search } from 'lucide-react'
import Pagination from '../ui/Pagination'
import EditCreditorModal from './EditCreditorModal'
import { useAcreedores } from '../../queries/acreedores.query'
import {
  acreedorToFrontend,
  type BackendAcreedor,
  type Creditor,
} from '../../adapters/acreedores.adapter'
import { formatDateValue } from '../../utils/date'

const PAGE_SIZE = 8

const CURRENCY_LABELS: Record<string, string> = {
  EUR: '€ EUR',
  USD: '$ USD',
  BRL: 'R$ BRL',
  USDT: '₮ USDT',
  METAL: 'Metal',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  BRL: 'R$',
  USDT: '₮',
  METAL: '',
}

const CURRENCY_COLORS: Record<string, string> = {
  EUR:   'bg-blue-100 text-blue-700',
  USD:   'bg-green-100 text-green-700',
  BRL:   'bg-yellow-100 text-yellow-700',
  USDT:  'bg-purple-100 text-purple-700',
  METAL: 'bg-amber-100 text-amber-700',
}

export default function CreditorsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [editingDebts, setEditingDebts] = useState<Creditor[] | null>(null)

  const { data, isLoading } = useAcreedores()

  const creditors: Creditor[] = ((data as BackendAcreedor[] | undefined) ?? []).flatMap(
    acreedorToFrontend,
  )

  const availableCurrencies = Array.from(new Set(creditors.map((c) => c.currency))).filter(Boolean)

  const filtered = creditors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesCurrency = currencyFilter === '' || c.currency === currencyFilter
    return matchesSearch && matchesCurrency
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const emptyRows = Math.max(0, PAGE_SIZE - paginated.length)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCurrencyChange = (value: string) => {
    setCurrencyFilter(value)
    setCurrentPage(1)
  }

  const handleRowClick = (row: Creditor) => {
    const allDebts = creditors.filter((c) => c.id === row.id)
    setEditingDebts(allDebts)
  }

  const formatAmount = (creditor: Creditor) => {
    const sym = CURRENCY_SYMBOLS[creditor.currency] ?? ''
    return `${sym}${creditor.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={currencyFilter}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las monedas</option>
            {availableCurrencies.map((c) => (
              <option key={c} value={c}>{CURRENCY_LABELS[c] ?? c}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="h-[484px] flex items-center justify-center">
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Nombre</th>
                  <th className="text-left py-2 font-medium">Moneda</th>
                  <th className="text-left py-2 font-medium">Importe</th>
                  <th className="text-left py-2 font-medium">Vencimiento</th>
                  <th className="text-left py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((creditor) => (
                  <tr
                    key={creditor.saldoId}
                    onClick={() => handleRowClick(creditor)}
                    className="h-14 align-middle border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                          {creditor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-800 font-medium truncate">{creditor.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${CURRENCY_COLORS[creditor.currency] ?? 'bg-gray-100 text-gray-600'}`}>
                        {creditor.currency}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-red-600">{formatAmount(creditor)}</td>
                    <td className="py-3 text-gray-600">{formatDateValue(creditor.dueDate)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          creditor.status === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {creditor.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 ? (
                  <tr aria-hidden>
                    <td colSpan={5} className="h-[448px] text-center align-middle text-sm text-gray-400">
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
                      <td className="py-3" colSpan={5}>
                        <span className="opacity-0">placeholder</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                {filtered.length === 0
                  ? 'Sin resultados'
                  : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} de ${filtered.length} resultados`}
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

      {editingDebts && (
        <EditCreditorModal
          debts={editingDebts}
          onClose={() => setEditingDebts(null)}
          onSave={() => setEditingDebts(null)}
        />
      )}
    </>
  )
}
