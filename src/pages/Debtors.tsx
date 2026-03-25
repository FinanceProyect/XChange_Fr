import { useNavigate } from "react-router-dom";
import { useDashboardCurrencyBalances } from "../queries/dashboard.query";
import { useState } from "react";
import { Plus } from "lucide-react";
import DebtorsTable from "../components/debtors/DebtorsTable";
import AddDebtorModal from "../components/debtors/AddDebtorModal";
import Toast from "../components/ui/Toast";

export default function Debtors() {
  const navigate = useNavigate();
  const { data: remoteBalances } = useDashboardCurrencyBalances();
  const balances = Array.isArray(remoteBalances) ? remoteBalances : [];
  const totalFromCards = balances.reduce((acc, balance) => {
    const amount =
      typeof balance.amount === "number"
        ? balance.amount
        : Number(balance.amount ?? 0);
    if (Number.isNaN(amount)) return acc;
    return acc + amount;
  }, 0);
  const showBalanceAlert = balances.length === 0 || totalFromCards <= 0;
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
  };

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Overlay de saldo sin configurar */}
      {showBalanceAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[4px] transition-all animate-fadein">
          <div className="flex flex-col gap-5 items-center bg-white/95 border border-red-100 rounded-2xl p-8 shadow-xl max-w-xs text-center backdrop-blur-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-2 shadow-md">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-black">
              Saldo disponible sin configurar
            </p>
            <p className="text-sm text-black">
              Para empezar a operar, establece un saldo inicial en la sección de
              configuración.
            </p>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Ir a configuración
            </button>
          </div>
          <style>{`
            @keyframes fadein {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadein { animation: fadein 0.5s; }
          `}</style>
        </div>
      )}
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
