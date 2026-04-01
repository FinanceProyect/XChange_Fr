import { useState } from "react";
import { X } from "lucide-react";
import type { Debtor } from "../../data/mockData";
import { usePagarDeudor } from "../../queries/deudores.query";
import { showToast } from "../../lib/toastBus";

interface FormState {
  nombre: string;
  importe: string;
}

interface EditDebtorModalProps {
  debtor: Debtor;
  onClose: () => void;
  onSave: () => void;
}

export default function EditDebtorModal({
  debtor,
  onClose,
  onSave,
}: EditDebtorModalProps) {
  const [form, setForm] = useState<FormState>({
    nombre: debtor.name,
    importe: "",
  });

  const { mutate: pagarDeudor, isPending } = usePagarDeudor();

  const importeNumber = parseFloat(form.importe);
  const isValid =
    form.nombre.trim() !== "" &&
    form.importe.trim() !== "" &&
    !Number.isNaN(importeNumber) &&
    importeNumber > 0;

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!isValid) return;

    pagarDeudor(
      {
        id: debtor.id,
        importe: importeNumber,
      },
      {
        onSuccess: (updated) => {
          const nextState = (
            (updated as { state?: string; estado?: string } | undefined)
              ?.state ??
            (updated as { estado?: string } | undefined)?.estado ??
            ""
          ).toString();
          const normalizedState = nextState.toUpperCase();

          if (normalizedState === "PAGADO") {
            showToast({
              message: "El usuario ya ha pagado su deuda",
              variant: "success",
            });
          } else {
            showToast({
              message: "Pago guardado correctamente",
              variant: "success",
            });
          }

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
            Editar deudor
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
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Importe a pagar */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Importe a pagar
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.importe}
              onChange={(e) => set("importe", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-green-200 cursor-not-allowed"
            }`}
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
}
