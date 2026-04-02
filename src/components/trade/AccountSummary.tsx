const rows = [
  { label: 'Balance total',        value: '$24,580.00', color: 'text-gray-800'   },
  { label: 'Disponible para operar', value: '$8,450.00',  color: 'text-green-600'  },
  { label: 'En órdenes',           value: '$2,100.00',  color: 'text-orange-500' },
  { label: 'En posiciones',        value: '$5,230.00',  color: 'text-blue-600'   },
  { label: 'G/P del día',          value: '+$285.90',   color: 'text-green-600'  },
]

export default function AccountSummary() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Resumen de cuenta</h2>
      <div className="flex flex-col gap-2">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
