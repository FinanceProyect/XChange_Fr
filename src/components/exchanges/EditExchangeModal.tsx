import { useState } from 'react'
import { X } from 'lucide-react'
import type { Exchange } from './ExchangesTable'
import { useUpdateIntercambio } from '../../queries/intercambios.query'

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'USDT']

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  BRL: 'R$',
  USDT: '₮',
  ARS: '$',
}

interface EditExchangeModalProps {
  exchange: Exchange
  onClose: () => void
  onSave: () => void
}

const inputClass =
  'w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500'

export default function EditExchangeModal({ exchange, onClose, onSave }: EditExchangeModalProps) {
  const [entrada, setEntrada] = useState(String(exchange.entrada))
  const [entradaCurrency, setEntradaCurrency] = useState(exchange.entradaCurrency)
  const [salida, setSalida] = useState(String(exchange.salida))
  const [salidaCurrency, setSalidaCurrency] = useState(exchange.salidaCurrency)
  const [tasaCambio, setTasaCambio] = useState(String(exchange.tasaCambio))
  const { mutate: updateIntercambio, isPending } = useUpdateIntercambio()

  const formatAmount = (amount: number, currency: string) => {
    const sym = CURRENCY_SYMBOLS[currency] ?? ''
    return `${sym}${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }

  const isValid =
    entrada !== '' &&
    parseFloat(entrada) > 0 &&
    salida !== '' &&
    parseFloat(salida) > 0 &&
    tasaCambio !== '' &&
    parseFloat(tasaCambio) > 0

  const handleSave = () => {
    if (!isValid) return

    updateIntercambio(
      {
        id: exchange.id,
        data: {
          montoEntrada: parseFloat(entrada),
          monedaEntrada: entradaCurrency,
          montoSalida: parseFloat(salida),
          monedaSalida: salidaCurrency,
          tasaCambio: parseFloat(tasaCambio),
        },
      },
      {
        onSuccess: () => {
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
          <h2 className="text-base font-semibold text-gray-900">Editar intercambio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Entrada</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Moneda entrada</label>
              <select
                value={entradaCurrency}
                onChange={(e) => setEntradaCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Salida</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Moneda salida</label>
              <select
                value={salidaCurrency}
                onChange={(e) => setSalidaCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Tasa de cambio
              <span className="ml-1 text-gray-400 normal-case">
                (actual: {formatAmount(exchange.tasaCambio, exchange.salidaCurrency)})
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={tasaCambio}
              onChange={(e) => setTasaCambio(e.target.value)}
              className={inputClass}
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
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-blue-200 cursor-not-allowed'
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
