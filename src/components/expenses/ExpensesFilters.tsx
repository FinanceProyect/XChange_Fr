import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useCategoriasGasto } from "../../queries/gastos.query"
import { MESES } from "./constants"

interface ExpensesFiltersProps {
  anio: number
  mes: number
  onMesChange: (anio: number, mes: number) => void
  categoriaId: string
  onCategoriaChange: (id: string) => void
  beneficiario: string
  onBeneficiarioChange: (value: string) => void
  onNuevo: () => void
}

export default function ExpensesFilters({
  anio,
  mes,
  onMesChange,
  categoriaId,
  onCategoriaChange,
  beneficiario,
  onBeneficiarioChange,
  onNuevo,
}: ExpensesFiltersProps) {
  const { data: categorias = [] } = useCategoriasGasto()

  const moverMes = (delta: number) => {
    const total = anio * 12 + (mes - 1) + delta
    onMesChange(Math.floor(total / 12), (total % 12) + 1)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
        <button
          onClick={() => moverMes(-1)}
          aria-label="Mes anterior"
          className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-gray-800 min-w-[9rem] text-center">
          {MESES[mes - 1]} {anio}
        </span>
        <button
          onClick={() => moverMes(1)}
          aria-label="Mes siguiente"
          className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <select
        value={categoriaId}
        onChange={(e) => onCategoriaChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Beneficiario"
        value={beneficiario}
        onChange={(e) => onBeneficiarioChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <button
        onClick={onNuevo}
        className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
      >
        <Plus size={15} />
        Registrar gasto
      </button>
    </div>
  )
}
