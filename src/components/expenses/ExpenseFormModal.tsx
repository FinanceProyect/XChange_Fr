import { useState } from "react"
import { X } from "lucide-react"
import type { GastoDTO, GastoRequest } from "../../services/gastos.service"
import {
  useCategoriasGasto,
  useCreateCategoriaGasto,
  useCreateGasto,
  useSugerenciasBeneficiario,
  useUpdateGasto,
} from "../../queries/gastos.query"
import { useDashboardCurrencyBalances } from "../../queries/dashboard.query"
import DatePicker from "../operations/AddOperationProgress/DatePicker"
import { formatAmount } from "../../utils/formatAmount"
import { showToast } from "../../lib/toastBus"
import { MONEDAS, hoyISO, simboloMoneda } from "./constants"

interface ExpenseFormModalProps {
  gasto?: GastoDTO
  onClose: () => void
}

interface FormState {
  categoriaId: string
  moneda: string
  monto: string
  fecha: string
  beneficiario: string
  detalle: string
}

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
    invalid ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"
  }`

export default function ExpenseFormModal({ gasto, onClose }: ExpenseFormModalProps) {
  const editando = gasto !== undefined

  const [form, setForm] = useState<FormState>({
    categoriaId: gasto?.categoriaId ?? "",
    moneda: gasto?.moneda ?? "",
    monto: gasto ? String(gasto.monto) : "",
    fecha: gasto?.fecha ?? hoyISO(),
    beneficiario: gasto?.beneficiario ?? "",
    detalle: gasto?.detalle ?? "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")

  const { data: categorias = [] } = useCategoriasGasto()
  const { data: balances } = useDashboardCurrencyBalances()
  const { data: sugerencias = [] } = useSugerenciasBeneficiario(form.beneficiario)
  const { mutate: crearCategoria, isPending: creandoCat } = useCreateCategoriaGasto()
  const { mutate: crearGasto, isPending: creando } = useCreateGasto()
  const { mutate: actualizarGasto, isPending: actualizando } = useUpdateGasto()
  const isPending = creando || actualizando

  const montoNumero = parseFloat(form.monto)
  const montoValido = !Number.isNaN(montoNumero) && montoNumero > 0

  const isValid =
    form.categoriaId !== "" && form.moneda !== "" && montoValido && form.fecha !== ""

  // Saldo disponible para la moneda elegida. Al editar, el monto anterior vuelve al Balance antes de aplicar el nuevo.
  const saldoActual = balances?.cards.find((c) => c.currency === form.moneda)?.amount
  const saldoDisponible =
    saldoActual === undefined
      ? undefined
      : saldoActual + (editando && gasto?.moneda === form.moneda ? gasto.monto : 0)
  const quedaraNegativo = montoValido && saldoDisponible !== undefined && montoNumero > saldoDisponible

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleCrearCategoria = () => {
    const nombre = nuevaCategoria.trim()
    if (nombre === "") return
    crearCategoria(nombre, {
      onSuccess: (creada) => {
        set("categoriaId", creada.id)
        setNuevaCategoria("")
        setCreandoCategoria(false)
      },
    })
  }

  const handleSave = () => {
    setSubmitted(true)
    if (!isValid) return

    const payload: GastoRequest = {
      categoriaId: form.categoriaId,
      moneda: form.moneda,
      monto: montoNumero,
      fecha: form.fecha,
      detalle: form.detalle.trim() || null,
      beneficiario: form.beneficiario.trim() || null,
    }

    const opciones = {
      onSuccess: () => {
        showToast({
          message: editando ? "Gasto actualizado" : "Gasto registrado",
          variant: "success",
        })
        onClose()
      },
    }

    if (gasto) {
      actualizarGasto({ id: gasto.id, data: payload }, opciones)
    } else {
      crearGasto(payload, opciones)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {editando ? "Editar gasto" : "Registrar gasto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
            <select
              value={form.categoriaId}
              onChange={(e) => set("categoriaId", e.target.value)}
              className={inputClass(submitted && form.categoriaId === "")}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {submitted && form.categoriaId === "" && (
              <p className="text-xs text-red-500 mt-0.5">Selecciona una categoría</p>
            )}

            {!creandoCategoria ? (
              <button
                type="button"
                onClick={() => setCreandoCategoria(true)}
                className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer"
              >
                + Nueva categoría
              </button>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nombre de la categoría"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className={inputClass(false)}
                />
                <button
                  type="button"
                  onClick={handleCrearCategoria}
                  disabled={creandoCat || nuevaCategoria.trim() === ""}
                  className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer disabled:opacity-40"
                >
                  Crear
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => set("moneda", e.target.value)}
              className={inputClass(submitted && form.moneda === "")}
            >
              <option value="">Seleccionar moneda</option>
              {MONEDAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {submitted && form.moneda === "" && (
              <p className="text-xs text-red-500 mt-0.5">Selecciona una moneda</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monto</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.monto}
              onChange={(e) => set("monto", e.target.value)}
              className={inputClass(submitted && !montoValido)}
            />
            {submitted && !montoValido && (
              <p className="text-xs text-red-500 mt-0.5">Debe ser mayor a 0</p>
            )}
            {quedaraNegativo && form.moneda !== "" && (
              <p className="text-xs text-amber-600 mt-1">
                El Balance de {form.moneda} quedará negativo (disponible:{" "}
                {formatAmount(saldoDisponible ?? 0, simboloMoneda(form.moneda))}). Puedes registrar igual.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
            <DatePicker value={form.fecha} onChange={(v) => set("fecha", v)} error={submitted && form.fecha === ""} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Beneficiario (opcional)</label>
            <input
              type="text"
              list="beneficiarios-sugeridos"
              placeholder="Ej: Lourdes"
              value={form.beneficiario}
              onChange={(e) => set("beneficiario", e.target.value)}
              className={inputClass(false)}
            />
            <datalist id="beneficiarios-sugeridos">
              {sugerencias.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Detalle (opcional)</label>
            <textarea
              rows={2}
              value={form.detalle}
              onChange={(e) => set("detalle", e.target.value)}
              className={inputClass(false)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              !isPending ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-blue-200 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
