import { useState } from "react";
import { X } from "lucide-react";
import { useCreateDeudor } from "../../queries/deudores.query";
import DatePicker from "../operations/AddOperationProgress/DatePicker";

const CURRENCIES = ["USD", "EUR", "BRL", "USDT", "METAL"];

interface FormState {
  nombre: string;
  moneda: string;
  importe: string;
  fechaVencimiento: string;
}

const EMPTY: FormState = { nombre: "", moneda: "", importe: "", fechaVencimiento: "" };

interface AddDebtorModalProps {
  onClose: () => void;
  onSave: () => void;
}

const formatLocalDateTime = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const offsetMinutes = now.getTimezoneOffset();
  const sign = offsetMinutes > 0 ? "-" : "+";
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetRemainder = pad(Math.abs(offsetMinutes) % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainder}`;
};

export default function AddDebtorModal({
  onClose,
  onSave,
}: AddDebtorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const { mutate: createDeudor, isPending } = useCreateDeudor();

  const isValid =
    form.nombre.trim() !== "" &&
    form.moneda !== "" &&
    form.importe !== "" &&
    parseFloat(form.importe) > 0 &&
    form.fechaVencimiento !== "";

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!isValid) return;
    createDeudor(
      {
        nombre: form.nombre.trim(),
        fecha: formatLocalDateTime(),
        deudas: [
          {
            moneda: form.moneda,
            monto: parseFloat(form.importe),
            fechaVencimiento: form.fechaVencimiento,
          },
        ],
      },
      {
        onSuccess: () => {
          onSave();
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Nuevo deudor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Nombre */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Nombre del deudor
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Moneda */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => set("moneda", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar moneda</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Importe */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.importe}
              onChange={(e) => set("importe", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Fecha de vencimiento
            </label>
            <DatePicker
              value={form.fechaVencimiento}
              onChange={(v) => set("fechaVencimiento", v)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isValid && !isPending
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-blue-200 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
