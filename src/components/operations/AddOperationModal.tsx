import { useState } from "react";
import { X } from "lucide-react";
import type { OperationType, OperationCurrency } from "../../data/mockData";
import { useCreateOperacion } from "../../queries/operaciones.query";
import DebtorAutocomplete from "../debtors/DebtorAutocomplete";

const QUILATAJE_OPTIONS = ["8k", "9k", "10k", "14k", "18k", "22k", "24k"];

interface FormState {
  currency: OperationCurrency | "";
  type: OperationType | "";
  amount: string;
  cotizacion: string;
  quilataje: string;
  peso: string;
  addDebtor: boolean;
  debtorName: string;
  debtorId: string | null;
}

const EMPTY: FormState = {
  currency: "",
  type: "",
  amount: "",
  cotizacion: "",
  quilataje: "",
  peso: "",
  addDebtor: false,
  debtorName: "",
  debtorId: null,
};

interface AddOperationModalProps {
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

export default function AddOperationModal({
  onClose,
  onSave,
}: AddOperationModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const { mutate: createOperacion, isPending } = useCreateOperacion();

  const isMetal = form.currency === "METAL";

  const baseValid =
    form.currency !== "" &&
    form.type !== "" &&
    form.cotizacion !== "" &&
    parseFloat(form.cotizacion) > 0;

  const metalValid = isMetal
    ? form.quilataje !== "" && form.peso !== "" && parseFloat(form.peso) > 0
    : form.amount !== "";

  const debtorValid =
    !form.addDebtor ||
    form.debtorName.trim() !== "";

  const isValid = baseValid && metalValid && debtorValid;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCurrencyChange = (value: OperationCurrency | "") => {
    setForm((prev) => ({
      ...prev,
      currency: value,
      amount: "",
      quilataje: "",
      peso: "",
    }));
  };

  const toggleDebtorSection = () =>
    setForm((prev) => {
      if (prev.type === "") return prev;
      const nextAdd = !prev.addDebtor;
      return {
        ...prev,
        addDebtor: nextAdd,
        debtorName: nextAdd ? prev.debtorName : "",
        debtorId: nextAdd ? prev.debtorId : null,
      };
    });

  const handleTypeSelect = (t: OperationType) =>
    setForm((prev) => ({
      ...prev,
      type: t,
    }));

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) return;

    const payload: Record<string, unknown> = {
      tipo: form.type === "Compra" ? "COMPRA" : "VENTA",
      activoId: form.currency,
      tasaCambio: parseFloat(form.cotizacion),
      fechaHora: formatLocalDateTime(),
    };

    if (isMetal) {
      payload.quilataje = form.quilataje;
      payload.peso = parseFloat(form.peso);
    } else {
      payload.monto = parseFloat(form.amount);
    }

    if (form.addDebtor) {
      payload.nombre = form.debtorName.trim();
      payload.fecha = formatLocalDateTime();
      if (form.debtorId) {
        payload.id = form.debtorId;
      }
    }

    createOperacion(payload, {
      onSuccess: () => {
        onSave();
        onClose();
      },
    });
  };

  const fieldClass = (invalid: boolean) =>
    `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 ${
      invalid
        ? "border-red-400 focus:ring-red-400"
        : "border-gray-200 focus:ring-blue-500"
    }`;

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
          {/* Moneda / Activo */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) =>
                handleCurrencyChange(e.target.value as OperationCurrency | "")
              }
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar moneda</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="USD">$ Dólar (USD)</option>
              <option value="BRL">R$ Real Brasileño (BRL)</option>
              <option value="USDT">₮ Tether (USDT)</option>
              <option value="METAL">Metal</option>
            </select>
          </div>

          {/* Campos de metal visibles siempre */}
          <div className="grid grid-cols-1 gap-3">
            {/* Quilataje */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Quilataje
              </label>
              <select
                value={form.quilataje}
                onChange={(e) => set("quilataje", e.target.value)}
                disabled={!isMetal}
                className={`${fieldClass(
                  submitted && isMetal && form.quilataje === "",
                )} ${
                  isMetal
                    ? "bg-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <option value="">Seleccionar quilataje</option>
                {QUILATAJE_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              {submitted && isMetal && form.quilataje === "" && (
                <p className="text-xs text-red-500 mt-0.5">Campo requerido</p>
              )}
            </div>

            {/* Peso */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Peso (gramos)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.peso}
                onChange={(e) => set("peso", e.target.value)}
                disabled={!isMetal}
                className={`${fieldClass(
                  submitted &&
                    isMetal &&
                    (form.peso === "" || parseFloat(form.peso) <= 0),
                )} ${
                  isMetal
                    ? "bg-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              />
              {submitted &&
                isMetal &&
                (form.peso === "" || parseFloat(form.peso) <= 0) && (
                  <p className="text-xs text-red-500 mt-0.5">
                    Debe ser mayor a 0
                  </p>
                )}
            </div>
          </div>

          {/* Cantidad (siempre visible pero deshabilitada para metal) */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cantidad</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              disabled={isMetal}
              className={`w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isMetal
                  ? "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 text-gray-700"
              }`}
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
              className={fieldClass(
                submitted &&
                  (form.cotizacion === "" || parseFloat(form.cotizacion) <= 0),
              )}
            />
            {submitted &&
              (form.cotizacion === "" || parseFloat(form.cotizacion) <= 0) && (
                <p className="text-xs text-red-500 mt-0.5">
                  Debe ser mayor a 0
                </p>
              )}
          </div>

          {/* Toggle deudor */}
          <div
            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
              form.type !== ""
                ? "border-gray-200 bg-gray-50"
                : "border-dashed border-gray-200 bg-gray-100"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-700">
                Datos del deudor
              </p>
              <p className="text-xs text-gray-500">
                {form.type !== ""
                  ? "Activa para registrar el nombre del deudor"
                  : "Selecciona primero el tipo de operación"}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDebtorSection}
              disabled={form.type === ""}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.type !== ""
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

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Nombre del deudor
            </label>
            <DebtorAutocomplete
              nombre={form.debtorName}
              selectedId={form.debtorId}
              disabled={!form.addDebtor || form.type === ""}
              onChange={(nombre, id) =>
                setForm((prev) => ({ ...prev, debtorName: nombre, debtorId: id }))
              }
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
            disabled={isPending}
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
