import type { ReactNode } from 'react'
import ValidationMessage from './ValidationMessage'

interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
  showError?: boolean
}

export default function FormField({ label, children, error, showError }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
      {children}
      {showError && error && <ValidationMessage message={error} />}
    </div>
  )
}
