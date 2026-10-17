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
  const { data: remoteBalances, isLoading } = useDashboardCurrencyBalances();
  const balances = remoteBalances?.cards ?? [];
  const showBalanceAlert =
    !isLoading &&
    balances.length > 0 &&
    balances.every(
      (b) =>
        (typeof b.amount === "number" ? b.amount : Number(b.amount ?? 0)) === 0,
    );
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState<OperationCurrency | "">("");
  const [type, setType] = useState<OperationType | "">("");

  const handleReset = () => {
    setCurrency("");
    setType("");
  };

  const handleSave = (message?: string) => {
    setToastMessage(message ?? "Operación guardada correctamente");
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-10 w-72 bg-gray-200 rounded-lg mb-4" />
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-50 flex items-center gap-4">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Operaciones
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Historial de compras, ventas e intercambios de divisas
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
