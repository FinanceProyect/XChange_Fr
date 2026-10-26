import type { ResumenMonedaDTO } from "../../services/gastos.service"
import { formatAmount } from "../../utils/formatAmount"
import { simboloMoneda } from "./constants"

interface ExpensesTotalsProps {
  resumen: ResumenMonedaDTO[]
}

export default function ExpensesTotals({ resumen }: ExpensesTotalsProps) {
  if (resumen.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 text-sm text-gray-500">
        No hay gastos registrados en este mes.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {resumen.map((r) => (
        <div key={r.moneda} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total {r.moneda}</p>
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(r.total, simboloMoneda(r.moneda))}
          </p>
        </div>
      ))}
    </div>
  )
}
