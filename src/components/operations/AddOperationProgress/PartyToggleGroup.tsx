import ToggleSwitch from './ToggleSwitch'

interface PartyToggleGroupProps {
  hasDebtor: boolean
  hasCreditor: boolean
  opType: string
  onToggleDebtor: (v: boolean) => void
  onToggleCreditor: (v: boolean) => void
}

export default function PartyToggleGroup({
  hasDebtor,
  hasCreditor,
  opType,
  onToggleDebtor,
  onToggleCreditor,
}: PartyToggleGroupProps) {
  const isVenta = opType === 'Venta'

  return (
    <div className="flex flex-col gap-2">
      <ToggleSwitch
        label="Añadir deudor"
        description="Activa para añadir datos del deudor"
        checked={hasDebtor}
        onChange={onToggleDebtor}
        disabled={false}
      />
      <ToggleSwitch
        label="Añadir acreedor"
        description={
          isVenta
            ? 'No disponible en operaciones de venta'
            : 'Activa para añadir datos del acreedor'
        }
        checked={hasCreditor}
        onChange={onToggleCreditor}
        disabled={isVenta}
      />
    </div>
  )
}
