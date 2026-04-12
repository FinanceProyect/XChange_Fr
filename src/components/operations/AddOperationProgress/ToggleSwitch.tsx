interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
  description?: string
}

export default function ToggleSwitch({ checked, onChange, disabled, label, description }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 w-full text-left ${
        !disabled
          ? 'border-gray-200 bg-gray-50'
          : 'border-dashed border-gray-200 bg-gray-100'
      }`}
    >
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  )
}
