import type { DebtorStatus } from '../../data/mockData'

interface BadgeProps {
  status: DebtorStatus
}

const statusStyles: Record<DebtorStatus, string> = {
  Overdue: 'bg-red-100 text-red-600',
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid:    'bg-green-100 text-green-700',
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  )
}
