import { useState } from "react";
import { X } from "lucide-react";
import type { OperationType, OperationCurrency } from "../../data/mockData";
import { useCreateOperacion } from "../../queries/operaciones.query";

interface FormState {
  currency: OperationCurrency | "";
  type: OperationType | "";
  amount: string;
  cotizacion: string;
  addDebtor: boolean;
  debtorName: string;
  debtorDocument: string;
}

const EMPTY: FormState = {
  currency: "",
  type: "",
  amount: "",
  cotizacion: "",
  addDebtor: false,
  debtorName: "",
  debtorDocument: "",
};

interface AddOperationModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddOperationModal({
  onClose,
  onSave,
}: AddOperationModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const { mutate: createOperacion, isPending } = useCreateOperacion();

  const baseValid =
    form.currency !== "" &&
    form.type !== "" &&
    form.amount !== "" &&
    form.cotizacion !== "";

  const debtorValid =
    !form.addDebtor ||
    (form.debtorName.trim() !== "" && form.debtorDocument.trim() !== "");

  const isValid = baseValid && debtorValid;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDebtorSection = () =>
    setForm((prev) => {
      if (prev.type !== "Venta") {
        return prev;
      }

      const nextAdd = !prev.addDebtor;
      return {
        ...prev,
        addDebtor: nextAdd,
        debtorName: nextAdd ? prev.debtorName : "",
        debtorDocument: nextAdd ? prev.debtorDocument : "",
      };
    });

  const handleTypeSelect = (t: OperationType) =>
    setForm((prev) => ({
      ...prev,
      type: t,
      addDebtor: t === "Venta" ? prev.addDebtor : false,
      debtorName: t === "Venta" ? prev.debtorName : "",
      debtorDocument: t === "Venta" ? prev.debtorDocument : "",
    }));

  const handleSave = () => {
    if (!isValid) return;
    const payload: Record<string, unknown> = {
      tipo: form.type === "Compra" ? "COMPRA" : "VENTA",
      activoId: form.currency,
      monto: parseFloat(form.amount),
      tasaCambio: parseFloat(form.cotizacion),
    };

    if (form.addDebtor && form.type === "Venta") {
      payload.nombre = form.debtorName.trim();
      payload.documento = form.debtorDocument.trim();
    }

    createOperacion(payload, {
      onSuccess: () => {
        onSave();
        onClose();
      },
    });
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
            Nueva operación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tipo — Compra / Venta */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1.5 block">
            Tipo de operación
          </label>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {(["Compra", "Venta"] as OperationType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTypeSelect(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  form.type === t
                    ? t === "Compra"
                      ? "bg-green-600 text-white"
                      : "bg-red-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Moneda */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) =>
                set("currency", e.target.value as OperationCurrency)
              }
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar moneda</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="USD">$ Dólar (USD)</option>
              <option value="BRL">R$ Real Brasileño (BRL)</option>
              <option value="USDT">₮ Tether (USDT)</option>
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cantidad</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Cotización */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Cotización
            </label>
            <input
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.0000"
              value={form.cotizacion}
              onChange={(e) => set("cotizacion", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Toggle deudor */}
          <div
            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
              form.type === "Venta"
                ? "border-gray-200 bg-gray-50"
                : "border-dashed border-gray-200 bg-gray-100"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-700">
                Datos del deudor
              </p>
              <p className="text-xs text-gray-500">
                {form.type === "Venta"
                  ? "Activa para registrar nombre y documento"
                  : "Solo disponible para una venta"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDebtorSection}
              disabled={form.type !== "Venta"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.type === "Venta"
                  ? form.addDebtor
                    ? "bg-blue-600"
                    : "bg-gray-300"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  form.addDebtor ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Nombre del deudor
              </label>
              <input
                type="text"
                value={form.debtorName}
                disabled={!form.addDebtor || form.type !== "Venta"}
                onChange={(e) => set("debtorName", e.target.value)}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  form.addDebtor
                    ? "border-gray-200 text-gray-700 bg-white"
                    : "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                placeholder="Nombre y apellido"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Documento
              </label>
              <input
                type="text"
                value={form.debtorDocument}
                disabled={!form.addDebtor || form.type !== "Venta"}
                onChange={(e) => set("debtorDocument", e.target.value)}
                className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  form.addDebtor
                    ? "border-gray-200 text-gray-700 bg-white"
                    : "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                placeholder="DNI / Pasaporte"
              />
            </div>
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
