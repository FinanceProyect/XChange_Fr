import { Trash2 } from "lucide-react";
import type { Operation } from "../../data/mockData";
import { useDeleteOperacion } from "../../queries/operaciones.query";

interface DeleteOperationModalProps {
  operation: Operation;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteOperationModal({
  operation,
  onClose,
  onDeleted,
}: DeleteOperationModalProps) {
  const { mutate: deleteOperacion, isPending } = useDeleteOperacion();

  const handleConfirm = () => {
    deleteOperacion(operation.id, {
      onSuccess: () => {
        onDeleted();
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
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 w-full max-w-[380px] mx-4 p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-[17px] font-medium text-gray-900">
              Eliminar operación
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              ¿Estás seguro de que quieres eliminar esta operación? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-[10px] border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex-1 py-[10px] rounded-lg text-sm font-semibold text-white transition-colors ${
              isPending
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 cursor-pointer"
            }`}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
