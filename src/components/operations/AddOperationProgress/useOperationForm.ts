import { useState, useMemo } from 'react'
import type { OperationForm, StepId } from './operation.types'
import { METAL_CURRENCIES } from './operation.types'
import { calcularSalidaIntercambio, monedasSalidaPermitidas } from '../../../utils/intercambio'

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
  exchangeFrom: '',
  exchangeTo: '',
  exchangeAmount: '',
  exchangeQuote: '',
}

export default function useOperationForm() {
  const [form, setForm] = useState<OperationForm>(initialForm)
  const [step, setStep] = useState<StepId>(1)
  const [showErrors, setShowErrors] = useState(false)

  const isMetal = METAL_CURRENCIES.includes(form.currency as typeof METAL_CURRENCIES[number])
  const isExchange = form.opType === 'Intercambio'
  const needsStep2 = !isExchange && (form.hasDebtor || form.hasCreditor)

  const computedAmount = useMemo(() => {
    const qty = parseFloat(form.quantity)
    const qt = parseFloat(form.quote)
    if (!isNaN(qty) && !isNaN(qt) && qty > 0 && qt > 0) {
      return (qty * qt).toFixed(2)
    }
    return ''
  }, [form.quantity, form.quote])

  const exchangeOutput = calcularSalidaIntercambio(
    parseFloat(form.exchangeAmount),
    form.exchangeFrom,
    form.exchangeTo,
    parseFloat(form.exchangeQuote),
  )

  const updateField = <K extends keyof OperationForm>(key: K, value: OperationForm[K]) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      if (key === 'currency' && !METAL_CURRENCIES.includes(value as typeof METAL_CURRENCIES[number])) {
        updated.karat = ''
        updated.weight = ''
      }
      if (key === 'hasDebtor' && value === true) {
        updated.hasCreditor = false
      }
      if (key === 'hasCreditor' && value === true) {
        updated.hasDebtor = false
      }
      if (key === 'opType' && value === 'Venta') {
        updated.hasCreditor = false
      }
      if (key === 'opType' && value === 'Intercambio') {
        updated.hasDebtor = false
        updated.hasCreditor = false
      }
      // Mantener "Cliente recibe" dentro del par válido; si hay una sola opción (USD), se elige sola
      if (key === 'exchangeFrom') {
        const permitidas = monedasSalidaPermitidas(value as string) as string[]
        if (!permitidas.includes(updated.exchangeTo)) {
          updated.exchangeTo = permitidas.length === 1 ? permitidas[0] : ''
        }
      }
      return updated
    })
  }

  const validateStep = (s: StepId): Partial<Record<keyof OperationForm, string>> => {
    const errors: Partial<Record<keyof OperationForm, string>> = {}
    if (s === 1 && isExchange) {
      if (!form.exchangeFrom) errors.exchangeFrom = 'Selecciona la moneda que entrega el cliente'
      if (!form.exchangeAmount || parseFloat(form.exchangeAmount) <= 0) errors.exchangeAmount = 'Ingresa un monto válido'
      if (!form.exchangeTo) errors.exchangeTo = 'Selecciona la moneda que recibe el cliente'
      if (!form.exchangeQuote || parseFloat(form.exchangeQuote) <= 0) {
        errors.exchangeQuote = 'Ingresa una cotización válida'
      } else if (exchangeOutput === 0) {
        errors.exchangeAmount = 'El cliente recibiría menos de una unidad'
      }
      return errors
    }
    if (s === 1) {
      if (!form.currency) errors.currency = 'Selecciona una moneda'
      if (isMetal) {
        if (!form.karat) errors.karat = 'Selecciona el quilataje'
        if (!form.weight || parseFloat(form.weight) <= 0) errors.weight = 'Ingresa el peso'
      } else {
        if (!form.quantity || parseFloat(form.quantity) <= 0) errors.quantity = 'Ingresa una cantidad válida'
      }
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
    isExchange,
    exchangeOutput,
    computedAmount,
    isCurrentStepValid,
    errors,
    showErrors,
    triggerValidation,
    resetShowErrors,
    reset,
  }
}
