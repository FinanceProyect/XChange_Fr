const KARAT_OPTIONS = ['8k', '9k', '10k', '14k', '18k', '22k', '24k']

const fieldClass = (disabled: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 ${
    disabled
      ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
      : 'bg-white text-gray-700 border-gray-200 focus:ring-blue-500'
  }`

interface MetalFieldsProps {
  karat: string
  weight: string
  isMetal: boolean
  onChange: (field: 'karat' | 'weight', value: string) => void
}

export default function MetalFields({ karat, weight, isMetal, onChange }: MetalFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Quilataje</label>
        <select
          value={karat}
          onChange={e => onChange('karat', e.target.value)}
          disabled={!isMetal}
          className={fieldClass(!isMetal)}
        >
          <option value="">Seleccionar quilataje</option>
          {KARAT_OPTIONS.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Peso (gramos)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={weight}
          onChange={e => onChange('weight', e.target.value)}
          disabled={!isMetal}
          className={fieldClass(!isMetal)}
        />
      </div>
    </div>
  )
}
