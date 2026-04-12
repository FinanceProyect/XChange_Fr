interface ModalFooterProps {
  onBack: () => void
  onNext: () => void
  isBackDisabled: boolean
  isNextDisabled: boolean
  nextLabel: 'Continuar' | 'Guardar'
}

export default function ModalFooter({
  onBack,
  onNext,
  isBackDisabled,
  isNextDisabled,
  nextLabel,
}: ModalFooterProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={onBack}
        disabled={isBackDisabled}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isBackDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isNextDisabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  )
}
