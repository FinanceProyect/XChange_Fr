import { useState } from 'react'
import { UserPlus, CheckCircle, Download, Pencil, Check } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Pagination from '../ui/Pagination'
import { debtorsData } from '../../data/mockData'

const PAGE_SIZE = 8

export default function DebtorsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(debtorsData.length / PAGE_SIZE)

  const paginated = debtorsData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Gestión de Deudores</h2>
          <p className="text-xs text-gray-500 mt-0.5">Seguimiento y gestión de deudas pendientes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button label="+ Añadir"   variant="primary"   icon={UserPlus}    />
          <Button label="Marcar Pagado" variant="success" icon={CheckCircle} />
          <Button label="Exportar"   variant="secondary" icon={Download}    />
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left py-2 font-medium">Fecha</th>
            <th className="text-left py-2 font-medium">Nombre</th>
            <th className="text-left py-2 font-medium">Importe</th>
            <th className="text-left py-2 font-medium">Estado</th>
            <th className="text-left py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((debtor) => (
            <tr key={debtor.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 text-gray-600">{debtor.date}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {debtor.avatar}
                  </div>
                  <span className="text-gray-800 font-medium">{debtor.name}</span>
                </div>
              </td>
              <td className="py-3 text-gray-800 font-medium">{debtor.amount}</td>
              <td className="py-3">
                <Badge status={debtor.status} />
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors">
                    <Check size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-500">
          Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, debtorsData.length)} de {debtorsData.length} resultados
        </p>
        <Pagination current={currentPage} total={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}
