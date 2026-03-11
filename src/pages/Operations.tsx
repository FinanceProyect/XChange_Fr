import { useState } from 'react'
import { Plus } from 'lucide-react'
import OperationsFilters from '../components/operations/OperationsFilters'
import OperationsTable from '../components/operations/OperationsTable'
import AddOperationModal from '../components/operations/AddOperationModal'
import Toast from '../components/ui/Toast'
import type { OperationCurrency, OperationType } from '../data/mockData'

export default function Operations() {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [currency, setCurrency] = useState<OperationCurrency | ''>('')
  const [type, setType] = useState<OperationType | ''>('')

  const handleReset = () => {
    setCurrency('')
    setType('')
  }

  const handleSave = () => {
    setShowToast(true)
  }

  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Operaciones</h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Historial de operaciones de compra y venta de divisas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={15} />
          Añadir
        </button>
      </div>

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

      {showModal && (
        <AddOperationModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showToast && (
        <Toast
          message="Operación guardada correctamente"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
