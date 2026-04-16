import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { StepId } from './operation.types'
import useOperationForm from './useOperationForm'
import StepIndicator from './StepIndicator'
import ModalFooter from './ModalFooter'
import Step1Operation from './Step1Operation'
import Step2Parties from './Step2Parties'
import Step3Summary from './Step3Summary'
import { useCreateOperacion } from '../../../queries/operaciones.query'

const formatLocalDateTime = () => {
  const now = new Date()
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())
  const offsetMinutes = now.getTimezoneOffset()
  const sign = offsetMinutes > 0 ? '-' : '+'
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60))
  const offsetRemainder = pad(Math.abs(offsetMinutes) % 60)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainder}`
}

interface AddOperationProgressProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function AddOperationProgress({ isOpen, onClose, onSave }: AddOperationProgressProps) {
  const {
    form,
    updateField,
    step,
    goNext,
    goBack,
    needsStep2,
    isMetal,
    computedAmount,
    isCurrentStepValid,
    errors,
    showErrors,
    reset,
  } = useOperationForm()

  const { mutate: createOperacion, isPending } = useCreateOperacion()

  if (!isOpen) return null

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      tipo: form.opType === 'Compra' ? 'COMPRA' : 'VENTA',
      activoId: form.currency,
      tasaCambio: parseFloat(form.quote),
    }

    if (isMetal) {
      payload.quilataje = form.karat
      payload.peso = parseFloat(form.weight)
    } else {
      payload.monto = parseFloat(form.quantity)
    }

    if (form.hasDebtor) {
      payload.deudor = {
        nombre: form.debtorName.trim(),
        fecha: formatLocalDateTime(),
      }
    }

    if (form.hasCreditor) {
      payload.acreedor = {
        nombre: form.creditorName.trim(),
        fechaVencimiento: form.creditorDueDate,
      }
    }

    createOperacion(payload, {
      onSuccess: () => {
        reset()
        onSave()
        onClose()
      },
    })
  }

  const stepComponents: Record<StepId, ReactNode> = {
    1: (
      <Step1Operation
        form={form}
        updateField={updateField}
        errors={errors}
        showErrors={showErrors}
        isMetal={isMetal}
      />
    ),
    2: (
      <Step2Parties
        form={form}
        updateField={updateField}
        errors={errors}
        showErrors={showErrors}
        computedAmount={computedAmount}
      />
    ),
    3: (
      <Step3Summary
        form={form}
        isMetal={isMetal}
      />
    ),
  }

  const skippedSteps: StepId[] = !needsStep2 && step === 3 ? [2] : []

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <StepIndicator currentStep={step} skippedSteps={skippedSteps} />
        {stepComponents[step]}
        <ModalFooter
          onBack={goBack}
          onNext={step === 3 ? handleSave : goNext}
          isBackDisabled={step === 1}
          isNextDisabled={!isCurrentStepValid || (step === 3 && isPending)}
          nextLabel={step === 3 ? 'Guardar' : 'Continuar'}
        />
      </div>
    </div>
  )
}
