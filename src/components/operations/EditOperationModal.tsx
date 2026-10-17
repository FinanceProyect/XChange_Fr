import { useState } from "react";
import { X } from "lucide-react";
import type { Operation, OperationCurrency, OperationType } from "../../data/mockData";
import { useUpdateOperacion } from "../../queries/operaciones.query";
import { formatDateValue, formatTimeValue } from "../../utils/date";

const currencySymbol: Record<OperationCurrency, string> = {
  EUR:   "€",
  USD:   "$",
  BRL:   "R$",
  USDT:  "₮",
  METAL: "g",
};

const currencyColors: Record<OperationCurrency, string> = {
  EUR:   "bg-blue-100 text-blue-700",
  USD:   "bg-green-100 text-green-700",
  BRL:   "bg-yellow-100 text-yellow-700",
  USDT:  "bg-purple-100 text-purple-700",
  METAL: "bg-amber-100 text-amber-700",
};

const typeColors: Record<OperationType, string> = {
  Compra: "bg-green-100 text-green-700",
  Venta:  "bg-red-100 text-red-600",
  Intercambio: "bg-blue-100 text-blue-700",
};

interface EditOperationModalProps {
  operation: Operation;
  onClose: () => void;
  onSave: () => void;
}

export default function EditOperationModal({
  operation,
  onClose,
  onSave,
}: EditOperationModalProps) {
  const isMetal = operation.currency === "METAL";
  const initialAmount = isMetal
    ? (operation.peso ?? operation.amount).toString()
    : operation.amount.toString();

  const [amount, setAmount] = useState(initialAmount);
  const [cotizacion, setCotizacion] = useState(operation.buyPrice.toString());
  const [submitted, setSubmitted] = useState(false);

  const { mutate: updateOperacion, isPending } = useUpdateOperacion();

  const sym = currencySymbol[operation.currency];

  const amountValid = amount !== "" && parseFloat(amount) > 0;
  const cotizacionValid = cotizacion !== "" && parseFloat(cotizacion) > 0;
  const isValid = amountValid && cotizacionValid;

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) return;

    const payload: Record<string, unknown> = {
      tasaCambio: parseFloat(cotizacion),
    };

    if (isMetal) {
      payload.peso = parseFloat(amount);
    } else {
      payload.monto = parseFloat(amount);
    }

    updateOperacion(
      { id: operation.id, data: payload },
      {
        onSuccess: () => {
          onSave();
          onClose();
        },
      },
    );
  };

  const inputClass = (invalid: boolean) =>
    `w-full text-sm px-3 py-[9px] rounded-lg focus:outline-none focus:ring-1 ${
      invalid
        ? "border border-red-400 focus:ring-red-400"
        : "border border-gray-200 focus:ring-blue-500"
    }`;

  const metadataCards = [
    {
      label: "FECHA",
      content: (
        <p className="text-sm font-medium text-gray-800">
          {formatDateValue(operation.dateTime ?? operation.date)}
        </p>
      ),
    },
    {
      label: "HORA",
      content: (
        <p className="text-sm font-medium text-gray-800">
          {formatTimeValue(operation.dateTime ?? operation.date)}
        </p>
      ),
    },
    {
      label: "MONEDA",
      content: (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${currencyColors[operation.currency]}`}
        >
          {isMetal
            ? `METAL${operation.quilataje ? ` ${operation.quilataje}` : ""}`
            : `${sym} ${operation.currency}`}
        </span>
      ),
    },
    {
      label: "TIPO",
      content: (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[operation.type]}`}
        >
          {operation.type}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor — max 420px, border 0.5px, radius 16px */}
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 w-full max-w-[420px] mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-[17px] font-medium text-gray-900">
            Editar operación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadatos — grid 2 cols, 4 tarjetas */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {metadataCards.map(({ label, content }) => (
            <div
              key={label}
              className="bg-[#fafafa] shadow-sm rounded-[10px] px-3.5 py-2.5"
            >
              <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1">
                {label}
              </p>
              {content}
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="flex flex-col gap-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {isMetal ? "Peso (gramos)" : "Cantidad"}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass(submitted && !amountValid)}
            />
            {submitted && !amountValid && (
              <p className="text-xs text-red-500 mt-0.5">Debe ser mayor a 0</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Cotización
            </label>
            <input
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.0000"
              value={cotizacion}
              onChange={(e) => setCotizacion(e.target.value)}
              className={inputClass(submitted && !cotizacionValid)}
            />
            {submitted && !cotizacionValid && (
              <p className="text-xs text-red-500 mt-0.5">Debe ser mayor a 0</p>
            )}
          </div>
        </div>

        {/* Botones — Cancelar (1fr) + Guardar cambios (2fr) */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-[10px] border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex-1 py-[10px] rounded-lg text-sm font-semibold text-white transition-colors ${
              isValid && !isPending
                ? "bg-[#2563eb] hover:bg-blue-700 cursor-pointer"
                : "bg-blue-200 cursor-not-allowed"
            }`}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
