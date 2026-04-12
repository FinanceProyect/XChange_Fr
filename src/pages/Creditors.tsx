import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDashboardCurrencyBalances } from '../queries/dashboard.query'
import CreditorsTable from '../components/creditors/CreditorsTable'
import AddCreditorModal from '../components/creditors/AddCreditorModal'
import BalanceAlertOverlay from '../components/ui/BalanceAlertOverlay'
import Toast from '../components/ui/Toast'

export default function Creditors() {
  const { data: remoteBalances } = useDashboardCurrencyBalances()
  const balances = Array.isArray(remoteBalances) ? remoteBalances : []
  const showBalanceAlert =
    balances.length > 0 &&
    balances.every(
      (b) => (typeof b.amount === 'number' ? b.amount : Number(b.amount ?? 0)) === 0,
    )

  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

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
