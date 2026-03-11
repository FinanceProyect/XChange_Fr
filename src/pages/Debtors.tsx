import { useState } from 'react'
import { Plus } from 'lucide-react'
import DebtorsTable from '../components/debtors/DebtorsTable'
import AddDebtorModal from '../components/debtors/AddDebtorModal'
import Toast from '../components/ui/Toast'

export default function Debtors() {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleSave = () => {
    setShowToast(true)
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Deudores</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Seguimiento y gestión de deudas pendientes</p>
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
  )
}
