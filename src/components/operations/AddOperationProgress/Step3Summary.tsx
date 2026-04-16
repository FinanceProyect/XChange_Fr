import type { OperationForm } from './operation.types'

interface Step3SummaryProps {
  form: OperationForm
  isMetal: boolean
}

interface SummaryRowProps {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

export default function Step3Summary({ form, isMetal }: Step3SummaryProps) {
  return (
    <div className="flex flex-col gap-1 bg-gray-50 rounded-lg p-4">
      <SummaryRow label="Tipo" value={form.opType} />
      <SummaryRow label="Moneda" value={form.currency} />
      {isMetal && form.karat && <SummaryRow label="Quilataje" value={form.karat} />}
      {isMetal && form.weight && <SummaryRow label="Peso" value={`${form.weight} g`} />}
      <SummaryRow label="Monto" value={form.quantity} />
      <SummaryRow label="Cotización" value={form.quote} />
      {form.hasDebtor && <SummaryRow label="Deudor" value={form.debtorName} />}
      {form.hasCreditor && (
        <>
          <SummaryRow label="Acreedor" value={form.creditorName} />
          <SummaryRow label="Moneda acreedor" value={form.currency} />
          <SummaryRow label="Fecha de vencimiento" value={form.creditorDueDate} />
        </>
      )}
    </div>
  )
}
