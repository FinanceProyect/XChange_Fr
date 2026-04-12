import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { OperationForm, StepId } from './operation.types'
import useOperationForm from './useOperationForm'
import StepIndicator from './StepIndicator'
import ModalFooter from './ModalFooter'
import Step1Operation from './Step1Operation'
import Step2Parties from './Step2Parties'
import Step3Summary from './Step3Summary'

interface AddOperationProgressProps {
  isOpen: boolean
  onClose: () => void
  onSave: (form: OperationForm) => void
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
  } = useOperationForm()

  if (!isOpen) return null

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
        computedAmount={computedAmount}
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
          onNext={step === 3 ? () => { onSave(form); onClose(); } : goNext}
          isBackDisabled={step === 1}
          isNextDisabled={!isCurrentStepValid}
          nextLabel={step === 3 ? 'Guardar' : 'Continuar'}
        />
      </div>
    </div>
  )
}
