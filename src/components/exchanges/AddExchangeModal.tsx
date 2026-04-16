import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateIntercambio } from '../../queries/intercambios.query'

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'USDT']

interface FormState {
  entradaCurrency: string
  entrada: string
  salidaCurrency: string
  salida: string
}

const EMPTY: FormState = {
  entradaCurrency: '',
  entrada: '',
  salidaCurrency: '',
  salida: '',
}

interface AddExchangeModalProps {
  onClose: () => void
  onSave: () => void
}

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'
  }`

export default function AddExchangeModal({ onClose, onSave }: AddExchangeModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const { mutate: createIntercambio, isPending } = useCreateIntercambio()

  const isValid =
    form.entradaCurrency !== '' &&
    form.entrada !== '' &&
    parseFloat(form.entrada) > 0 &&
    form.salidaCurrency !== '' &&
    form.salida !== '' &&
    parseFloat(form.salida) > 0

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    setSubmitted(true)
    if (!isValid) return

    createIntercambio(
      {
        activoEntrada: form.entradaCurrency,
        montoEntrada: parseFloat(form.entrada),
        activoSalida: form.salidaCurrency,
        montoSalida: parseFloat(form.salida),
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
          <h2 className="text-base font-semibold text-gray-900">Nuevo intercambio</h2>
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
              <label className="text-xs text-gray-500 mb-1 block">Monto entrada</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.entrada}
                onChange={(e) => set('entrada', e.target.value)}
                className={inputClass(submitted && (form.entrada === '' || parseFloat(form.entrada) <= 0))}
              />
              {submitted && (form.entrada === '' || parseFloat(form.entrada) <= 0) && (
                <p className="text-xs text-red-500 mt-0.5">Requerido</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Activo entrada</label>
              <select
                value={form.entradaCurrency}
                onChange={(e) => set('entradaCurrency', e.target.value)}
                className={inputClass(submitted && form.entradaCurrency === '')}
              >
                <option value="">Moneda</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {submitted && form.entradaCurrency === '' && (
                <p className="text-xs text-red-500 mt-0.5">Requerido</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Monto salida</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.salida}
                onChange={(e) => set('salida', e.target.value)}
                className={inputClass(submitted && (form.salida === '' || parseFloat(form.salida) <= 0))}
              />
              {submitted && (form.salida === '' || parseFloat(form.salida) <= 0) && (
                <p className="text-xs text-red-500 mt-0.5">Requerido</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Activo salida</label>
              <select
                value={form.salidaCurrency}
                onChange={(e) => set('salidaCurrency', e.target.value)}
                className={inputClass(submitted && form.salidaCurrency === '')}
              >
                <option value="">Moneda</option>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {submitted && form.salidaCurrency === '' && (
                <p className="text-xs text-red-500 mt-0.5">Requerido</p>
              )}
            </div>
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
            disabled={isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isPending ? 'bg-blue-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
