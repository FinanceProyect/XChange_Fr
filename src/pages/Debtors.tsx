// import { useNavigate } from "react-router-dom"; // Eliminado porque no se usa
import { useDashboardCurrencyBalances } from "../queries/dashboard.query";
import { useState } from "react";
import { Plus } from "lucide-react";
import DebtorsTable from "../components/debtors/DebtorsTable";
import AddDebtorModal from "../components/debtors/AddDebtorModal";

import BalanceAlertOverlay from "../components/ui/BalanceAlertOverlay";
import Toast from "../components/ui/Toast";

export default function Debtors() {
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
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-60 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-50 flex items-center gap-4">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-7 w-7 bg-gray-200 rounded-full" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Overlay de saldo sin configurar */}
      {showBalanceAlert && <BalanceAlertOverlay />}
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Deudores
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Seguimiento y gestión de deudas pendientes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={15} />
          Añadir
        </button>
      </div>

      <DebtorsTable />

      {showModal && (
        <AddDebtorModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showToast && (
        <Toast
          message="Deudor guardado exitosamente"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
