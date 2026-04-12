import { useState } from "react";
import { useDashboardCurrencyBalances } from "../queries/dashboard.query";
import { Plus } from "lucide-react";
import OperationsFilters from "../components/operations/OperationsFilters";
import OperationsTable from "../components/operations/OperationsTable";
import AddOperationProgress from "../components/operations/AddOperationProgress/AddOperationProgress";

import Toast from "../components/ui/Toast";
import BalanceAlertOverlay from "../components/ui/BalanceAlertOverlay";
import type { OperationCurrency, OperationType } from "../data/mockData";

export default function Operations() {
  const { data: remoteBalances } = useDashboardCurrencyBalances();
  // Lógica similar a Dashboard para determinar si el saldo está configurado
  const balances = Array.isArray(remoteBalances) ? remoteBalances : [];
  // totalFromCards eliminado porque ya no se usa
  // Mostrar overlay solo si todos los saldos están en cero y balances no está vacío
  const showBalanceAlert =
    balances.length > 0 &&
    balances.every(
      (b) =>
        (typeof b.amount === "number" ? b.amount : Number(b.amount ?? 0)) === 0,
    );
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currency, setCurrency] = useState<OperationCurrency | "">("");
  const [type, setType] = useState<OperationType | "">("");

  const handleReset = () => {
    setCurrency("");
    setType("");
  };

  const handleSave = () => {
    setShowToast(true);
  };

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Operaciones
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Historial de operaciones de compra y venta de divisas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${showBalanceAlert ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
          disabled={showBalanceAlert}
        >
          <Plus size={15} />
          Añadir
        </button>
      </div>

      {showBalanceAlert && <BalanceAlertOverlay />}

      <div className="mb-4">
        <OperationsFilters
          currency={currency}
          type={type}
          onCurrencyChange={setCurrency}
          onTypeChange={setType}
          onReset={handleReset}
        />
      </div>
      <OperationsTable currency={currency} type={type} />

      <AddOperationProgress
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />

      {showToast && (
        <Toast
          message="Operación guardada correctamente"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
