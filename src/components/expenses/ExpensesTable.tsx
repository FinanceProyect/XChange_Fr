import { Pencil, Trash2 } from "lucide-react"
import type { GastoDTO } from "../../services/gastos.service"
import { useDeleteGasto } from "../../queries/gastos.query"
import { formatAmount } from "../../utils/formatAmount"
import { formatFecha, simboloMoneda } from "./constants"

interface ExpensesTableProps {
  gastos: GastoDTO[]
  onEditar: (gasto: GastoDTO) => void
}

export default function ExpensesTable({ gastos, onEditar }: ExpensesTableProps) {
  const { mutate: eliminar, isPending } = useDeleteGasto()

  if (gastos.length === 0) return null

  const handleEliminar = (gasto: GastoDTO) => {
    const ok = window.confirm(
      `¿Eliminar el gasto de ${formatAmount(gasto.monto, simboloMoneda(gasto.moneda))} (${gasto.categoria})? El monto volverá al Balance.`,
    )
    if (ok) eliminar(gasto.id)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Beneficiario</th>
            <th className="px-4 py-3 font-medium">Detalle</th>
            <th className="px-4 py-3 font-medium text-right">Monto</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b border-gray-50 last:border-0">
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatFecha(g.fecha)}</td>
              <td className="px-4 py-3 text-gray-700">{g.categoria}</td>
              <td className="px-4 py-3 text-gray-600">{g.beneficiario ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{g.detalle ?? "—"}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                {formatAmount(g.monto, simboloMoneda(g.moneda))} <span className="text-xs text-gray-400">{g.moneda}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditar(g)}
                    aria-label="Editar gasto"
                    className="p-1.5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleEliminar(g)}
                    disabled={isPending}
                    aria-label="Eliminar gasto"
                    className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
