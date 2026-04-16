import { useState, useEffect, useMemo } from 'react'
import type { OperationForm, StepId } from './operation.types'
import { METAL_CURRENCIES } from './operation.types'

const initialForm: OperationForm = {
  opType: 'Compra',
  currency: '',
  karat: '',
  weight: '',
  quantity: '',
  quote: '',
  hasDebtor: false,
  hasCreditor: false,
  debtorName: '',
  debtorAmount: '',
  creditorName: '',
  creditorAmount: '',
  creditorDueDate: '',
}

export default function useOperationForm() {
  const [form, setForm] = useState<OperationForm>(initialForm)
  const [step, setStep] = useState<StepId>(1)
  const [showErrors, setShowErrors] = useState(false)

  const isMetal = METAL_CURRENCIES.includes(form.currency as typeof METAL_CURRENCIES[number])
  const needsStep2 = form.hasDebtor || form.hasCreditor

  useEffect(() => {
    if (!isMetal) {
      setForm(prev => ({ ...prev, karat: '', weight: '' }))
    }
  }, [isMetal])

  const computedAmount = useMemo(() => {
    const qty = parseFloat(form.quantity)
    const qt = parseFloat(form.quote)
    if (!isNaN(qty) && !isNaN(qt) && qty > 0 && qt > 0) {
      return (qty * qt).toFixed(2)
    }
    return ''
  }, [form.quantity, form.quote])

  const updateField = <K extends keyof OperationForm>(key: K, value: OperationForm[K]) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      if (key === 'hasDebtor' && value === true) {
        updated.hasCreditor = false
      }
      if (key === 'hasCreditor' && value === true) {
        updated.hasDebtor = false
      }
      return updated
    })
  }

  const validateStep = (s: StepId): Partial<Record<keyof OperationForm, string>> => {
    const errors: Partial<Record<keyof OperationForm, string>> = {}
    if (s === 1) {
      if (!form.currency) errors.currency = 'Selecciona una moneda'
      if (!form.quantity || parseFloat(form.quantity) <= 0) errors.quantity = 'Ingresa una cantidad válida'
      if (!form.quote || parseFloat(form.quote) <= 0) errors.quote = 'Ingresa una cotización válida'
    }
    if (s === 2) {
      if (form.hasDebtor) {
        if (!form.debtorName.trim()) errors.debtorName = 'Ingresa el nombre del deudor'
        if (!form.debtorAmount || parseFloat(form.debtorAmount) <= 0) errors.debtorAmount = 'Ingresa un importe válido'
      }
      if (form.hasCreditor) {
        if (!form.creditorName.trim()) errors.creditorName = 'Ingresa el nombre del acreedor'
        if (!form.creditorAmount || parseFloat(form.creditorAmount) <= 0) errors.creditorAmount = 'Ingresa un importe válido'
        if (!form.creditorDueDate) errors.creditorDueDate = 'Selecciona una fecha de vencimiento'
      }
    }
    return errors
  }

  const errors = validateStep(step)
  const isCurrentStepValid = Object.keys(errors).length === 0

  const triggerValidation = () => {
    setShowErrors(true)
  }

  const resetShowErrors = () => {
    setShowErrors(false)
  }

  const goNext = () => {
    const currentErrors = validateStep(step)
    if (Object.keys(currentErrors).length > 0) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    if (step === 1) {
      if (!needsStep2) {
        setStep(3)
      } else {
        setForm(prev => ({
          ...prev,
          debtorAmount: prev.hasDebtor && !prev.debtorAmount ? computedAmount : prev.debtorAmount,
          creditorAmount: prev.hasCreditor && !prev.creditorAmount ? computedAmount : prev.creditorAmount,
        }))
        setStep(2)
      }
    } else if (step === 2) {
      setStep(3)
    }
  }

  const goBack = () => {
    setShowErrors(false)
    if (step === 3) {
      if (!needsStep2) {
        setStep(1)
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      setStep(1)
    }
  }

  const reset = () => {
    setForm(initialForm)
    setStep(1)
    setShowErrors(false)
  }

  return {
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
    triggerValidation,
    resetShowErrors,
    reset,
  }
}
