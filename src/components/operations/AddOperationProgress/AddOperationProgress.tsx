import { useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { X } from 'lucide-react'
import type { StepId } from './operation.types'
import useOperationForm from './useOperationForm'
import StepIndicator from './StepIndicator'
import ModalFooter from './ModalFooter'
import Step1Operation from './Step1Operation'
import Step2Parties from './Step2Parties'
import Step3Summary from './Step3Summary'
import { useCreateOperacion } from '../../../queries/operaciones.query'
import { useCreateIntercambio } from '../../../queries/intercambios.query'
import { toLocalISODateTime } from '../../../utils/date'

const backendErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    return data?.error ?? data?.message ?? fallback
  }
  return fallback
}

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
  onSave: (message?: string) => void
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
    isExchange,
    exchangeOutput,
    computedAmount,
    isCurrentStepValid,
    errors,
    showErrors,
    reset,
  } = useOperationForm()

  const { mutate: createOperacion, isPending: isOperacionPending } = useCreateOperacion()
  const { mutate: createIntercambio, isPending: isIntercambioPending } = useCreateIntercambio()
  const isPending = isOperacionPending || isIntercambioPending
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    setSaveError(null)
    onClose()
  }

  const handleBack = () => {
    setSaveError(null)
    goBack()
  }

  const handleSaveIntercambio = () => {
    setSaveError(null)
    createIntercambio(
      {
        activoEntrada: form.exchangeFrom,
        montoEntrada: parseFloat(form.exchangeAmount),
        activoSalida: form.exchangeTo,
        cotizacion: parseFloat(form.exchangeQuote),
      },
      {
        // El monto devuelto por el backend es el autoritativo
        onSuccess: (intercambio) => {
          reset()
          onSave(`Intercambio registrado: el cliente recibe ${Number(intercambio.montoSalida).toLocaleString('es-AR')} ${intercambio.activoSalida}`)
          onClose()
        },
        onError: (error) => {
          setSaveError(backendErrorMessage(error, 'No se pudo registrar el intercambio'))
        },
      },
    )
  }

  const handleSave = () => {
    if (isExchange) {
      handleSaveIntercambio()
      return
    }

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
        fechaVencimiento: toLocalISODateTime(form.creditorDueDate),
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
        isExchange={isExchange}
        exchangeOutput={exchangeOutput}
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
        isExchange={isExchange}
        exchangeOutput={exchangeOutput}
      />
    ),
  }

  const skippedSteps: StepId[] = !needsStep2 && step === 3 ? [2] : []

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-end mb-1">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <StepIndicator currentStep={step} skippedSteps={skippedSteps} />
        {stepComponents[step]}
        {saveError && (
          <p role="alert" className="mt-3 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
            {saveError}
          </p>
        )}
        <ModalFooter
          onBack={handleBack}
          onNext={step === 3 ? handleSave : goNext}
          isBackDisabled={step === 1}
          isNextDisabled={!isCurrentStepValid || (step === 3 && isPending)}
          nextLabel={step === 3 ? 'Guardar' : 'Continuar'}
        />
      </div>
    </div>
  )
}
