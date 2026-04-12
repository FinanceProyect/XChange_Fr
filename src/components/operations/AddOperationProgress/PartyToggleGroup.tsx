import ToggleSwitch from './ToggleSwitch'

interface PartyToggleGroupProps {
  hasDebtor: boolean
  hasCreditor: boolean
  onToggleDebtor: (v: boolean) => void
  onToggleCreditor: (v: boolean) => void
}

export default function PartyToggleGroup({
  hasDebtor,
  hasCreditor,
  onToggleDebtor,
  onToggleCreditor,
}: PartyToggleGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <ToggleSwitch
        label="Añadir deudor"
        description={
          hasCreditor
            ? 'Desactiva el acreedor primero'
            : 'Activa para añadir datos del deudor'
        }
        checked={hasDebtor}
        onChange={onToggleDebtor}
        disabled={hasCreditor}
      />
      <ToggleSwitch
        label="Añadir acreedor"
        description={
          hasDebtor
            ? 'Desactiva el deudor primero'
            : 'Activa para añadir datos del acreedor'
        }
        checked={hasCreditor}
        onChange={onToggleCreditor}
        disabled={hasDebtor}
      />
    </div>
  )
}
