import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Debtor } from "../../adapters/deudores.adapter";
import { useAgrandarDeuda } from "../../queries/deudores.query";
import { showToast } from "../../lib/toastBus";

interface AgrandarDeudaModalProps {
  debtor: Debtor;
  onClose: () => void;
}

const MOTIVO_MAX = 255;

export default function AgrandarDeudaModal({ debtor, onClose }: AgrandarDeudaModalProps) {
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const { mutate: agrandar, isPending } = useAgrandarDeuda();

  const montoNumero = parseFloat(monto);
  const isValid = !Number.isNaN(montoNumero) && montoNumero > 0 && motivo.length <= MOTIVO_MAX;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onClose]);

  const handleSave = () => {
    if (!isValid || isPending) return;
    setErrorServidor(null);

    agrandar(
      {
        deudorId: debtor.deudorId ?? debtor.id,
        moneda: debtor.moneda ?? "",
        monto: montoNumero,
        motivo: motivo.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({ message: "Deuda agrandada correctamente", variant: "success" });
          onClose();
        },
        onError: (error) => {
          const mensaje =
            (error as { response?: { data?: { error?: string } } }).response?.data?.error ??
            "No se pudo agrandar la deuda";
          setErrorServidor(mensaje);
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="agrandar-titulo">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={isPending ? undefined : onClose} />

      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="agrandar-titulo" className="text-base font-semibold text-gray-900">
            Agrandar deuda
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {debtor.name} · {debtor.moneda} · Pendiente actual {debtor.amount}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monto a agregar</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Motivo (opcional)</label>
            <input
              type="text"
              maxLength={MOTIVO_MAX}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {errorServidor && <p className="text-xs text-red-600">{errorServidor}</p>}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isPending}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
              isValid && !isPending
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isPending ? "Guardando..." : "Agrandar"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
