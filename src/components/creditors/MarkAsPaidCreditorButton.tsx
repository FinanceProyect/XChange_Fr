import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CheckCircle } from 'lucide-react'

interface MarkAsPaidCreditorButtonProps {
  disabled?: boolean
  loading?: boolean
  onConfirm: () => void
}

export default function MarkAsPaidCreditorButton({
  disabled = false,
  loading = false,
  onConfirm,
}: MarkAsPaidCreditorButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (disabled || loading) return
    setOpen((prev) => !prev)
  }

  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (loading) return
    setOpen(false)
    onConfirm()
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`transition-colors ${
          disabled || loading
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-green-500 hover:text-green-600 cursor-pointer'
        }`}
      >
        <CheckCircle size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[170px]">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Marcar como pagado
          </button>
        </div>
      )}
    </div>
  )
}
