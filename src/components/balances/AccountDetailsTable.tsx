import { Plus, Minus } from 'lucide-react'
import { accountsData } from '../../data/mockData'

export default function AccountDetailsTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800">Account Details</h2>
        <p className="text-xs text-gray-500 mt-0.5">Detailed breakdown by account and currency</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left py-2 font-medium">Account</th>
            <th className="text-left py-2 font-medium">Currency</th>
            <th className="text-left py-2 font-medium">Available</th>
            <th className="text-left py-2 font-medium">Locked</th>
            <th className="text-left py-2 font-medium">Total</th>
            <th className="text-left py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accountsData.map((row) => (
            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${row.iconBg}`}>
                    {row.icon}
                  </div>
                  <span className="text-gray-800 font-medium">{row.account}</span>
                </div>
              </td>
              <td className="py-3 text-gray-600">{row.currency}</td>
              <td className="py-3 text-green-600 font-medium">{row.available}</td>
              <td className="py-3 text-orange-500 font-medium">{row.locked}</td>
              <td className="py-3 text-gray-800 font-medium">{row.total}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-green-600 cursor-pointer transition-colors">
                    <Plus size={15} />
                  </button>
                  <button className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                    <Minus size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
