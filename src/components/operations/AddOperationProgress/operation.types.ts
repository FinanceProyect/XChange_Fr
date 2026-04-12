export type OperationType = 'Compra' | 'Venta'
export type StepId = 1 | 2 | 3
export const METAL_CURRENCIES = ['METAL'] as const
export const FIAT_CURRENCIES = ['EUR', 'USD', 'BRL', 'USDT'] as const
export type Currency = typeof METAL_CURRENCIES[number] | typeof FIAT_CURRENCIES[number] | ''

export interface OperationForm {
  opType: OperationType
  currency: Currency
  karat: string
  weight: string
  quantity: string
  quote: string
  hasDebtor: boolean
  hasCreditor: boolean
  debtorName: string
  debtorAmount: string
  creditorName: string
  creditorAmount: string
  creditorDueDate: string
}

export interface StepValidation {
  isValid: boolean
  errors: Partial<Record<keyof OperationForm, string>>
}
