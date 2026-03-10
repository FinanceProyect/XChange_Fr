import DebtorsTable from '../components/debtors/DebtorsTable'

export default function Debtors() {
  return (
    <div className="bg-gray-50 px-5 py-5 lg:px-8 lg:py-6">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Deudores</h1>
        <p className="text-xs lg:text-sm text-gray-500 mt-1">Seguimiento y gestión de deudas pendientes</p>
      </div>
      <DebtorsTable />
    </div>
  )
}
