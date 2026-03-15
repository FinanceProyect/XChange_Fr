import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateDeudor } from '../../queries/deudores.query'

interface FormState {
  nombre: string
  documento: string
  importe: string
}

const EMPTY: FormState = { nombre: '', documento: '', importe: '' }

interface AddDebtorModalProps {
  onClose: () => void
  onSave: () => void
}

export default function AddDebtorModal({ onClose, onSave }: AddDebtorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const { mutate: createDeudor, isPending } = useCreateDeudor()

  const isValid = form.nombre.trim() !== '' && form.documento.trim() !== '' && form.importe !== ''

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = () => {
    if (!isValid) return
    createDeudor(
      { nombre: form.nombre, documento: form.documento },
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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Nuevo deudor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Nombre */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre del deudor</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Documento */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Documento</label>
            <input
              type="text"
              placeholder="DNI / NIE / Pasaporte"
              value={form.documento}
              onChange={(e) => set('documento', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Importe */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.importe}
              onChange={(e) => set('importe', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
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
