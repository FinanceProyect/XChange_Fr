import type { Currency } from './operation.types'
import DatePicker from './DatePicker'

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'
  }`

interface CreditorFieldsProps {
  name: string
  amount: string
  dueDate: string
  currency: Currency
  onChange: (field: 'creditorName' | 'creditorAmount' | 'creditorDueDate', value: string) => void
  errors: Partial<Record<string, string>>
  showErrors: boolean
}

export default function CreditorFields({
  name,
  amount,
  dueDate,
  currency,
  onChange,
  errors,
  showErrors,
}: CreditorFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Nombre del acreedor</label>
        <input
          type="text"
          value={name}
          onChange={e => onChange('creditorName', e.target.value)}
          placeholder="Nombre completo"
          className={inputClass(showErrors && !!errors.creditorName)}
        />
        {showErrors && errors.creditorName && (
          <p className="text-xs text-red-500 mt-0.5">{errors.creditorName}</p>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
        <input
          type="text"
          value={currency}
          readOnly
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Importe</label>
        <input
          type="number"
          value={amount}
          onChange={e => onChange('creditorAmount', e.target.value)}
          min="0"
          step="0.01"
          placeholder="0.00"
          className={inputClass(showErrors && !!errors.creditorAmount)}
        />
        {showErrors && errors.creditorAmount && (
          <p className="text-xs text-red-500 mt-0.5">{errors.creditorAmount}</p>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Fecha de vencimiento</label>
        <DatePicker
          value={dueDate}
          onChange={v => onChange('creditorDueDate', v)}
          error={showErrors && !!errors.creditorDueDate}
        />
        {showErrors && errors.creditorDueDate && (
          <p className="text-xs text-red-500 mt-0.5">{errors.creditorDueDate}</p>
        )}
      </div>
    </div>
  )
}
