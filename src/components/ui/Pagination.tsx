import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  current: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ current, total, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-7 h-7 rounded text-sm font-medium cursor-pointer transition-colors ${
            page === current
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
