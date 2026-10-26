import { useState } from "react"
import ExpensesFilters from "../components/expenses/ExpensesFilters"
import ExpensesTotals from "../components/expenses/ExpensesTotals"
import ExpensesTable from "../components/expenses/ExpensesTable"
import ExpenseFormModal from "../components/expenses/ExpenseFormModal"
import type { GastoDTO } from "../services/gastos.service"
import { useGastos, useResumenGastos } from "../queries/gastos.query"

export default function Expenses() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [categoriaId, setCategoriaId] = useState("")
  const [beneficiario, setBeneficiario] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<GastoDTO | undefined>(undefined)

  const filtros = {
    anio,
    mes,
    categoriaId: categoriaId || undefined,
    beneficiario: beneficiario.trim() || undefined,
  }

  const { data: gastos = [], isLoading } = useGastos(filtros)
  const { data: resumen = [] } = useResumenGastos(filtros)

  const cerrarForm = () => {
    setShowForm(false)
    setEditando(undefined)
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gastos</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">
          Egresos del negocio. Cada gasto descuenta su monto del Balance de la moneda elegida.
        </p>
      </div>

      <ExpensesFilters
        anio={anio}
        mes={mes}
        onMesChange={(a, m) => {
          setAnio(a)
          setMes(m)
        }}
        categoriaId={categoriaId}
        onCategoriaChange={setCategoriaId}
        beneficiario={beneficiario}
        onBeneficiarioChange={setBeneficiario}
        onNuevo={() => {
          setEditando(undefined)
          setShowForm(true)
        }}
      />

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-40" />
      ) : (
        <>
          <ExpensesTotals resumen={resumen} />
          <ExpensesTable
            gastos={gastos}
            onEditar={(g) => {
              setEditando(g)
              setShowForm(true)
            }}
          />
        </>
      )}

      {showForm && <ExpenseFormModal gasto={editando} onClose={cerrarForm} />}
    </div>
  )
}
