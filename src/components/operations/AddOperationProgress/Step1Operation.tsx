import type { OperationForm } from './operation.types'
import OperationTypeToggle from './OperationTypeToggle'
import CurrencySelect from './CurrencySelect'
import MetalFields from './MetalFields'
import SectionDivider from './SectionDivider'
import PartyToggleGroup from './PartyToggleGroup'

interface Step1OperationProps {
  form: OperationForm
  updateField: <K extends keyof OperationForm>(key: K, value: OperationForm[K]) => void
  errors: Partial<Record<keyof OperationForm, string>>
  showErrors: boolean
  isMetal: boolean
}

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-200 focus:ring-blue-500'
  }`

export default function Step1Operation({
  form,
  updateField,
  errors,
  showErrors,
  isMetal,
}: Step1OperationProps) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1">
      <OperationTypeToggle
        value={form.opType}
        onChange={v => updateField('opType', v)}
      />
      <CurrencySelect
        value={form.currency}
        onChange={v => updateField('currency', v)}
        error={errors.currency}
        showError={showErrors}
      />
      <MetalFields
        karat={form.karat}
        weight={form.weight}
        isMetal={isMetal}
        onChange={(field, value) => updateField(field, value)}
      />
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Cantidad</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.quantity}
          onChange={e => updateField('quantity', e.target.value)}
          disabled={isMetal}
          className={
            isMetal
              ? 'w-full text-sm border border-gray-100 bg-gray-100 text-gray-400 rounded-md px-3 py-2 cursor-not-allowed focus:outline-none'
              : inputClass(showErrors && !!errors.quantity)
          }
        />
        {showErrors && errors.quantity && (
          <p className="text-xs text-red-500 mt-0.5">{errors.quantity}</p>
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Cotización</label>
        <input
          type="number"
          min="0"
          step="0.0001"
          placeholder="0.0000"
          value={form.quote}
          onChange={e => updateField('quote', e.target.value)}
          className={inputClass(showErrors && !!errors.quote)}
        />
        {showErrors && errors.quote && (
          <p className="text-xs text-red-500 mt-0.5">{errors.quote}</p>
        )}
      </div>
      <SectionDivider />
      <PartyToggleGroup
        hasDebtor={form.hasDebtor}
        hasCreditor={form.hasCreditor}
        opType={form.opType}
        onToggleDebtor={v => updateField('hasDebtor', v)}
        onToggleCreditor={v => updateField('hasCreditor', v)}
      />
    </div>
  )
}
