import type { OperationForm } from './operation.types'
import DebtorFields from './DebtorFields'
import CreditorFields from './CreditorFields'

interface Step2PartiesProps {
  form: OperationForm
  updateField: <K extends keyof OperationForm>(key: K, value: OperationForm[K]) => void
  errors: Partial<Record<keyof OperationForm, string>>
  showErrors: boolean
  computedAmount: string
}

export default function Step2Parties({
  form,
  updateField,
  errors,
  showErrors,
  computedAmount,
}: Step2PartiesProps) {
  if (form.hasDebtor) {
    return (
      <DebtorFields
        name={form.debtorName}
        amount={form.debtorAmount || computedAmount}
        onChange={(field, value) => updateField(field, value)}
        errors={errors}
        showErrors={showErrors}
      />
    )
  }

  if (form.hasCreditor) {
    return (
      <CreditorFields
        name={form.creditorName}
        amount={form.creditorAmount || computedAmount}
        dueDate={form.creditorDueDate}
        currency={form.currency}
        onChange={(field, value) => updateField(field, value)}
        errors={errors}
        showErrors={showErrors}
      />
    )
  }

  return (
    <p className="text-sm text-gray-500 text-center py-4">
      No se ha seleccionado ningún tipo de parte.
    </p>
  )
}
