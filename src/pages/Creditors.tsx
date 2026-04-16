import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDashboardCurrencyBalances } from '../queries/dashboard.query'
import CreditorsTable from '../components/creditors/CreditorsTable'
import AddCreditorModal from '../components/creditors/AddCreditorModal'
import BalanceAlertOverlay from '../components/ui/BalanceAlertOverlay'
import Toast from '../components/ui/Toast'

export default function Creditors() {
  const { data: remoteBalances, isLoading } = useDashboardCurrencyBalances()
  const balances = remoteBalances?.cards ?? []
  const showBalanceAlert =
    !isLoading &&
    balances.length > 0 &&
    balances.every(
      (b) => (typeof b.amount === 'number' ? b.amount : Number(b.amount ?? 0)) === 0,
    )

  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-50 flex items-center gap-4">
              <div className="h-7 w-7 bg-gray-200 rounded-full" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
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
      {showBalanceAlert && <BalanceAlertOverlay />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Acreedores</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">
            Seguimiento y gestión de deudas con acreedores
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

      <CreditorsTable />

      {showModal && (
        <AddCreditorModal
          onClose={() => setShowModal(false)}
          onSave={() => setShowToast(true)}
        />
      )}

      {showToast && (
        <Toast
          message="Acreedor guardado exitosamente"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
