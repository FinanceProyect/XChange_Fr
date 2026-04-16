import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateAcreedor } from '../../queries/acreedores.query'
import DatePicker from '../operations/AddOperationProgress/DatePicker'

const CURRENCIES = ['EUR', 'USD', 'BRL', 'USDT', 'METAL']
const TIPO_OPERACION = ['COMPRA', 'VENTA']

interface FormState {
  nombre: string
  moneda: string
  importe: string
  tipoOperacion: string
  fechaVencimiento: string
}

const EMPTY: FormState = { nombre: '', moneda: '', importe: '', tipoOperacion: '', fechaVencimiento: '' }

interface AddCreditorModalProps {
  onClose: () => void
  onSave: () => void
}

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'
  }`

export default function AddCreditorModal({ onClose, onSave }: AddCreditorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const { mutate: createAcreedor, isPending } = useCreateAcreedor()

  const isValid =
    form.nombre.trim() !== '' &&
    form.moneda !== '' &&
    form.importe !== '' &&
    parseFloat(form.importe) > 0 &&
    form.tipoOperacion !== ''

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    setSubmitted(true)
    if (!isValid) return
    createAcreedor(
      {
        nombre: form.nombre.trim(),
        ...(form.fechaVencimiento ? { fechaVencimiento: form.fechaVencimiento } : {}),
        saldos: [
          {
            codigoDivisa: form.moneda,
            monto: parseFloat(form.importe),
            tipoOperacion: form.tipoOperacion,
          },
        ],
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
          <h2 className="text-base font-semibold text-gray-900">Nuevo acreedor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre del acreedor</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className={inputClass(submitted && form.nombre.trim() === '')}
            />
            {submitted && form.nombre.trim() === '' && (
              <p className="text-xs text-red-500 mt-0.5">Campo requerido</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => set('moneda', e.target.value)}
              className={inputClass(submitted && form.moneda === '')}
            >
              <option value="">Seleccionar moneda</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {submitted && form.moneda === '' && (
              <p className="text-xs text-red-500 mt-0.5">Selecciona una moneda</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.importe}
              onChange={(e) => set('importe', e.target.value)}
              className={inputClass(submitted && (form.importe === '' || parseFloat(form.importe) <= 0))}
            />
            {submitted && (form.importe === '' || parseFloat(form.importe) <= 0) && (
              <p className="text-xs text-red-500 mt-0.5">Debe ser mayor a 0</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipo de operación</label>
            <select
              value={form.tipoOperacion}
              onChange={(e) => set('tipoOperacion', e.target.value)}
              className={inputClass(submitted && form.tipoOperacion === '')}
            >
              <option value="">Seleccionar tipo</option>
              {TIPO_OPERACION.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {submitted && form.tipoOperacion === '' && (
              <p className="text-xs text-red-500 mt-0.5">Selecciona un tipo de operación</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha de vencimiento (opcional)</label>
            <DatePicker
              value={form.fechaVencimiento}
              onChange={(v) => set('fechaVencimiento', v)}
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
            disabled={isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              !isPending
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
