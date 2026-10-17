import { useState, useRef } from 'react'
import type { Operation, OperationCurrency, OperationType } from '../../data/mockData'
import { useOperaciones } from '../../queries/operaciones.query'
import { operacionToFrontend, type BackendOperacion } from '../../adapters/operaciones.adapter'
import Pagination from '../ui/Pagination'
import { formatDateValue, formatTimeValue } from '../../utils/date'
import { formatCotizacionIntercambio, formatMovimientoIntercambio } from '../../utils/intercambio'
import EditOperationModal from './EditOperationModal'
import DeleteOperationModal from './DeleteOperationModal'

const currencySymbol: Record<OperationCurrency, string> = {
  EUR:   '€',
  USD:   '$',
  BRL:   'R$',
  USDT:  '₮',
  METAL: 'gr',
}

const currencyLabel: Record<OperationCurrency, string> = {
  EUR:   'EUR',
  USD:   'USD',
  BRL:   'BRL',
  USDT:  'USDT',
  METAL: 'Oro',
}

const currencyColors: Record<OperationCurrency, string> = {
  EUR:   'bg-blue-100 text-blue-700',
  USD:   'bg-green-100 text-green-700',
  BRL:   'bg-yellow-100 text-yellow-700',
  USDT:  'bg-purple-100 text-purple-700',
  METAL: 'bg-amber-100 text-amber-700',
}

const typeColors: Record<OperationType, string> = {
  Compra:      'bg-green-100 text-green-700',
  Venta:       'bg-red-100 text-red-600',
  Intercambio: 'bg-blue-100 text-blue-700',
}

const tipoParam: Record<OperationType, string> = {
  Compra:      'COMPRA',
  Venta:       'VENTA',
  Intercambio: 'INTERCAMBIO',
}

const PAGE_SIZE    = 8
const SWIPE_THRESHOLD = 90
const MAX_SWIPE       = 130

interface OperationsTableProps {
  currency: OperationCurrency | ''
  type: OperationType | ''
}

export default function OperationsTable({ currency, type }: OperationsTableProps) {
  const [page, setPage]               = useState(1)
  const [selectedOp, setSelectedOp]   = useState<Operation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Operation | null>(null)
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({})
  // Fila en arrastre: en estado (no en el ref) porque se lee durante el render
  const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null)
  const swipeStart   = useRef<{ id: string; x: number } | null>(null)
  const didSwipe     = useRef(false)

  // Volver a la página 1 al cambiar los filtros (ajuste durante el render, sin efecto)
  const filterKey = `${currency}|${type}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const params: Record<string, unknown> = { page: page - 1, size: PAGE_SIZE }
  if (currency) params.currency = currency
  if (type)     params.tipo     = tipoParam[type]

  const { data, isLoading } = useOperaciones(params)

  const response      = data as { content: BackendOperacion[]; totalPages: number; totalElements: number } | undefined
  const rows          = (response?.content ?? []).map(operacionToFrontend)
  const totalPages    = response?.totalPages    ?? 1
  const totalElements = response?.totalElements ?? 0
  const emptyRows     = Math.max(0, PAGE_SIZE - rows.length)

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    swipeStart.current = { id, x: e.touches[0].clientX }
    didSwipe.current   = false
    setActiveSwipeId(id)
  }

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!swipeStart.current || swipeStart.current.id !== id) return
    const delta = e.touches[0].clientX - swipeStart.current.x
    if (delta < 0) return
    const clamped = Math.min(delta, MAX_SWIPE)
    if (clamped > 10) didSwipe.current = true
    setSwipeOffsets(prev => ({ ...prev, [id]: clamped }))
  }

  const handleTouchEnd = (op: Operation) => {
    if (!swipeStart.current || swipeStart.current.id !== op.id) return
    swipeStart.current = null
    setActiveSwipeId(null)
    const offset = swipeOffsets[op.id] ?? 0
    if (offset >= SWIPE_THRESHOLD) {
      setSwipeOffsets(prev => ({ ...prev, [op.id]: MAX_SWIPE }))
      setDeleteTarget(op)
    } else {
      setSwipeOffsets(prev => ({ ...prev, [op.id]: 0 }))
    }
  }

  const handleRowClick = (op: Operation) => {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    setSelectedOp(op)
  }

  const handleDeleteClose = () => {
    if (deleteTarget) {
      setSwipeOffsets(prev => ({ ...prev, [deleteTarget.id]: 0 }))
    }
    setDeleteTarget(null)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-hidden">
        {isLoading && (
          <div className="h-[484px] flex items-center justify-center">
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
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
                  // Intercambios: solo lectura, sin editar/eliminar (ni click ni swipe)
                  if (op.type === 'Intercambio' && op.salidaCurrency) {
                    return (
                      <tr key={op.id} className="h-14 align-middle border-b border-gray-50">
                        <td className="py-3 px-3 text-gray-600">
                          {formatDateValue(op.dateTime ?? op.date)}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {formatTimeValue(op.dateTime ?? op.date)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currencyColors[op.currency]}`}>
                            {currencyLabel[op.currency]}
                          </span>
                          <span className="text-gray-400 text-xs mx-1">→</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currencyColors[op.salidaCurrency]}`}>
                            {currencyLabel[op.salidaCurrency]}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[op.type]}`}>
                            {op.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 font-medium whitespace-nowrap">
                          {formatMovimientoIntercambio(op.amount, op.currency, op.salidaAmount ?? 0, op.salidaCurrency)}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">
                          {formatCotizacionIntercambio(op.currency, op.salidaCurrency, op.buyPrice)}
                        </td>
                      </tr>
                    )
                  }

                  const sym     = currencySymbol[op.currency]
                  const isMetal = op.currency === 'METAL'
                  const offset  = swipeOffsets[op.id] ?? 0
                  const ratio   = Math.min(offset / SWIPE_THRESHOLD, 1)
                  const isActive = activeSwipeId === op.id

                  return (
                    <tr
                      key={op.id}
                      onClick={() => handleRowClick(op)}
                      onTouchStart={(e) => handleTouchStart(e, op.id)}
                      onTouchMove={(e)  => handleTouchMove(e, op.id)}
                      onTouchEnd={() => handleTouchEnd(op)}
                      className="h-14 align-middle border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{
                        transform:  `translateX(${offset}px)`,
                        transition: isActive ? 'none' : 'transform 0.25s ease',
                        backgroundColor: offset > 10
                          ? `rgba(239,68,68,${0.04 + ratio * 0.08})`
                          : undefined,
                      }}
                    >
                      <td className="py-3 px-3 text-gray-600">
                        {formatDateValue(op.dateTime ?? op.date)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {formatTimeValue(op.dateTime ?? op.date)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${currencyColors[op.currency]}`}>
                          {isMetal ? '' : `${sym} `}{currencyLabel[op.currency]}
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
                {rows.length === 0 ? (
                  <tr aria-hidden>
                    <td colSpan={6} className="h-[448px] text-center align-middle text-sm text-gray-400">
                      No se encontraron operaciones
                    </td>
                  </tr>
                ) : (
                  emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                    <tr
                      key={`placeholder-${index}`}
                      className="h-14 align-middle border-b border-gray-50"
                      aria-hidden
                    >
                      <td colSpan={6} className="py-3 px-3">
                        <span className="opacity-0">placeholder</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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

      {selectedOp && (
        <EditOperationModal
          operation={selectedOp}
          onClose={() => setSelectedOp(null)}
          onSave={() => setSelectedOp(null)}
        />
      )}

      {deleteTarget && (
        <DeleteOperationModal
          operation={deleteTarget}
          onClose={handleDeleteClose}
          onDeleted={handleDeleteClose}
        />
      )}
    </>
  )
}
