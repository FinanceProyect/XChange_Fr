import type { OperationForm } from './operation.types'
import FormField from './FormField'
import { useCotizacionBlue } from '../../../queries/cotizaciones.query'
import {
  MONEDAS_INTERCAMBIO,
  formatCotizacionIntercambio,
  monedaCotizada,
  monedasSalidaPermitidas,
} from '../../../utils/intercambio'

interface ExchangeFieldsProps {
  form: OperationForm
  updateField: <K extends keyof OperationForm>(key: K, value: OperationForm[K]) => void
  errors: Partial<Record<keyof OperationForm, string>>
  showErrors: boolean
  exchangeOutput: number | null
}

const currencyOptionLabel: Record<string, string> = {
  USD:  '$ Dólar (USD)',
  EUR:  '€ Euro (EUR)',
  BRL:  'R$ Real Brasileño (BRL)',
  USDT: '₮ Tether (USDT)',
}

const inputClass = (invalid: boolean) =>
  `w-full text-sm border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
    invalid
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-200 focus:ring-blue-500'
  }`

const formatArs = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 })

export default function ExchangeFields({
  form,
  updateField,
  errors,
  showErrors,
  exchangeOutput,
}: ExchangeFieldsProps) {
  const { data: blue, isSuccess: blueDisponible } = useCotizacionBlue()
  const salidas = monedasSalidaPermitidas(form.exchangeFrom)
  const quote = parseFloat(form.exchangeQuote)
  const parCompleto = !!form.exchangeFrom && !!form.exchangeTo
  const cotizada = parCompleto ? monedaCotizada(form.exchangeFrom, form.exchangeTo) : 'moneda'

  return (
    <>
      <FormField label="Cliente entrega" error={errors.exchangeAmount ?? errors.exchangeFrom} showError={showErrors}>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.exchangeAmount}
            onChange={e => updateField('exchangeAmount', e.target.value)}
            className={inputClass(showErrors && !!errors.exchangeAmount)}
          />
          <select
            value={form.exchangeFrom}
            onChange={e => updateField('exchangeFrom', e.target.value)}
            className={inputClass(showErrors && !!errors.exchangeFrom)}
          >
            <option value="">Moneda</option>
            {MONEDAS_INTERCAMBIO.map(c => (
              <option key={c} value={c}>{currencyOptionLabel[c]}</option>
            ))}
          </select>
        </div>
      </FormField>

      <FormField label="Cliente recibe" error={errors.exchangeTo} showError={showErrors}>
        <select
          value={form.exchangeTo}
          onChange={e => updateField('exchangeTo', e.target.value)}
          disabled={!form.exchangeFrom}
          className={inputClass(showErrors && !!errors.exchangeTo)}
        >
          <option value="">Moneda</option>
          {salidas.map(c => (
            <option key={c} value={c}>{currencyOptionLabel[c]}</option>
          ))}
        </select>
      </FormField>

      <FormField label={`Cotización (USD por 1 ${cotizada})`} error={errors.exchangeQuote} showError={showErrors}>
        <input
          type="number"
          min="0"
          step="0.0001"
          placeholder="0.0000"
          value={form.exchangeQuote}
          onChange={e => updateField('exchangeQuote', e.target.value)}
          className={inputClass(showErrors && !!errors.exchangeQuote)}
        />
      </FormField>

      {parCompleto && quote > 0 && (
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-900 flex flex-col gap-0.5">
          <span>{formatCotizacionIntercambio(form.exchangeFrom, form.exchangeTo, quote)}</span>
          {exchangeOutput !== null && (
            <span className="font-semibold">
              Cliente recibe: {exchangeOutput.toLocaleString('es-AR')} {form.exchangeTo}
            </span>
          )}
        </div>
      )}

      {blueDisponible && blue && (
        <p className="text-xs text-gray-500">
          Blue: compra {formatArs(blue.compra)} · venta {formatArs(blue.venta)}
        </p>
      )}
    </>
  )
}
