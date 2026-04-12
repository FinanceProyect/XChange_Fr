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

const MOCK_CREDITORS: Creditor[] = [
  { id: '1',  name: 'Banco Santander',    currency: 'EUR',  amount: 4200.00,  dueDate: '2025-06-15', status: 'Pending' },
  { id: '2',  name: 'Banco Santander',    currency: 'USD',  amount: 1800.00,  dueDate: '2025-06-15', status: 'Pending' },
  { id: '3',  name: 'Carlos Méndez',      currency: 'USD',  amount: 1500.50,  dueDate: '2025-05-30', status: 'Pending' },
  { id: '4',  name: 'Carlos Méndez',      currency: 'EUR',  amount: 600.00,   dueDate: '2025-05-30', status: 'Paid'    },
  { id: '5',  name: 'Proveedor Joyas SL', currency: 'EUR',  amount: 8750.00,  dueDate: '2025-07-01', status: 'Pending' },
  { id: '6',  name: 'María López',        currency: 'USDT', amount: 320.00,   dueDate: '2025-04-20', status: 'Paid'    },
  { id: '7',  name: 'Distribuidora BRL',  currency: 'BRL',  amount: 12000.00, dueDate: '2025-08-10', status: 'Pending' },
  { id: '8',  name: 'Distribuidora BRL',  currency: 'USD',  amount: 2200.00,  dueDate: '2025-08-10', status: 'Pending' },
  { id: '9',  name: 'Roberto Silva',      currency: 'USD',  amount: 950.75,   dueDate: '2025-05-05', status: 'Paid'    },
  { id: '10', name: 'Joyería Central',    currency: 'EUR',  amount: 3300.00,  dueDate: '2025-09-01', status: 'Pending' },
  { id: '11', name: 'Luis Fernández',     currency: 'USDT', amount: 500.00,   dueDate: '2025-06-28', status: 'Pending' },
  { id: '12', name: 'Luis Fernández',     currency: 'BRL',  amount: 3500.00,  dueDate: '2025-06-28', status: 'Pending' },
]

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

export default function CreditorsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [editingDebts, setEditingDebts] = useState<Creditor[] | null>(null)

  const { data, isLoading } = useAcreedores()

  const backendCreditors: Creditor[] = ((data as BackendAcreedor[] | undefined) ?? []).map(
    acreedorToFrontend,
  )
  const creditors: Creditor[] = backendCreditors.length > 0 ? backendCreditors : MOCK_CREDITORS

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
    const allDebts = creditors.filter((c) => c.name === row.name)
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
          <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
        )}

        {!isLoading && (
          <>
            <table className="w-full text-sm">
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
                    key={creditor.id}
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
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
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
                {emptyRows > 0 &&
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
                  ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No se encontraron resultados</p>
            )}

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
