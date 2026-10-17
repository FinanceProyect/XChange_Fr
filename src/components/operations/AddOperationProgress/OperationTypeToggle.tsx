import type { OperationType } from './operation.types'

interface OperationTypeToggleProps {
  value: OperationType
  onChange: (v: OperationType) => void
}

const activeClass: Record<OperationType, string> = {
  Compra:      'bg-green-600 text-white',
  Venta:       'bg-red-500 text-white',
  Intercambio: 'bg-blue-600 text-white',
}

export default function OperationTypeToggle({ value, onChange }: OperationTypeToggleProps) {
  return (
    <div className="mb-1">
      <label className="text-xs text-gray-500 mb-1.5 block">Tipo de operación</label>
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        {(['Compra', 'Venta', 'Intercambio'] as OperationType[]).map(type => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              value === type ? activeClass[type] : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}
