const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'
  }`

interface DebtorFieldsProps {
  name: string
  amount: string
  onChange: (field: 'debtorName' | 'debtorAmount', value: string) => void
  errors: Partial<Record<string, string>>
  showErrors: boolean
}

export default function DebtorFields({ name, amount, onChange, errors, showErrors }: DebtorFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Nombre del deudor</label>
        <input
          type="text"
          value={name}
          onChange={e => onChange('debtorName', e.target.value)}
          placeholder="Nombre completo"
          className={inputClass(showErrors && !!errors.debtorName)}
        />
        {showErrors && errors.debtorName && (
          <p className="text-xs text-red-500 mt-0.5">{errors.debtorName}</p>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Importe</label>
        <input
          type="number"
          value={amount}
          onChange={e => onChange('debtorAmount', e.target.value)}
          min="0"
          step="0.01"
          placeholder="0.00"
          className={inputClass(showErrors && !!errors.debtorAmount)}
        />
        {showErrors && errors.debtorAmount && (
          <p className="text-xs text-red-500 mt-0.5">{errors.debtorAmount}</p>
        )}
      </div>
    </div>
  )
}
