import { useState } from 'react'
import { X } from 'lucide-react'
import type { Creditor } from '../../adapters/acreedores.adapter'
import { usePagarAcreedor } from '../../queries/acreedores.query'
import { showToast } from '../../lib/toastBus'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', USD: '$', BRL: 'R$', USDT: '₮', METAL: '',
}

interface EditCreditorModalProps {
  debts: Creditor[]
  onClose: () => void
  onSave: () => void
}

export default function EditCreditorModal({ debts, onClose, onSave }: EditCreditorModalProps) {
  const firstPending = debts.find((d) => d.status === 'Pending') ?? debts[0]
  const [selectedCurrency, setSelectedCurrency] = useState(firstPending.currency)
  const [importe, setImporte] = useState('')

  const { mutate: pagarAcreedor, isPending } = usePagarAcreedor()

  const selectedDebt = debts.find((d) => d.currency === selectedCurrency) ?? firstPending
  const isPaid = selectedDebt.status === 'Paid'

  const importeNumber = parseFloat(importe)
  const isValid = !isPaid && importe.trim() !== '' && !Number.isNaN(importeNumber) && importeNumber > 0

  const formatAmount = (debt: Creditor) => {
    const sym = CURRENCY_SYMBOLS[debt.currency] ?? ''
    return `${sym}${debt.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    setImporte('')
  }

  const handleSave = () => {
    if (!isValid) return
    pagarAcreedor(
      { id: selectedDebt.id, pagos: [{ codigoDivisa: selectedCurrency, monto: importeNumber }] },
      {
        onSuccess: () => {
          showToast({ message: 'Pago al acreedor registrado correctamente', variant: 'success' })
          onSave()
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Editar acreedor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Nombre */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre del acreedor</label>
            <input
              type="text"
              value={firstPending.name}
              readOnly
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Moneda dropdown */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {debts.map((d) => (
                <option key={d.saldoId} value={d.currency}>
                  {d.currency} — {formatAmount(d)}
                  {d.status === 'Paid' ? ' (Pagado)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Importe pendiente (readonly, cambia con moneda) */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe pendiente</label>
            <input
              type="text"
              value={formatAmount(selectedDebt)}
              readOnly
              className={`w-full text-sm border border-gray-200 rounded-md px-3 py-2 cursor-not-allowed focus:outline-none font-medium ${
                isPaid ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-red-600'
              }`}
            />
            {isPaid && (
              <p className="text-xs text-green-600 mt-0.5">Esta deuda ya está pagada</p>
            )}
          </div>

          {/* Importe a pagar */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe a pagar</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              disabled={isPaid}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isPaid
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 text-gray-700'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isValid && !isPending
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-green-200 cursor-not-allowed'
            }`}
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  )
}
