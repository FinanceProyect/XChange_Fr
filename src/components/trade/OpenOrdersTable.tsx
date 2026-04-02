import { openOrdersData } from '../../data/mockData'

export default function OpenOrdersTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Órdenes abiertas</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left py-2 font-medium">Par</th>
            <th className="text-left py-2 font-medium">Tipo</th>
            <th className="text-left py-2 font-medium">Lado</th>
            <th className="text-left py-2 font-medium">Precio</th>
            <th className="text-left py-2 font-medium">Cantidad</th>
            <th className="text-left py-2 font-medium">Ejecutado</th>
            <th className="text-left py-2 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {openOrdersData.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 font-medium text-gray-800">{order.pair}</td>
              <td className="py-3 text-gray-600">{order.type}</td>
              <td className="py-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.side === 'Buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {order.side === 'Buy' ? 'Compra' : 'Venta'}
                </span>
              </td>
              <td className="py-3 text-gray-700">{order.price}</td>
              <td className="py-3 text-gray-700">{order.amount}</td>
              <td className="py-3 text-gray-700">{order.filled}</td>
              <td className="py-3">
                <button className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors">
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
