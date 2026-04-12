import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

type View = 'days' | 'months' | 'years'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const YEAR_PAGE = 12

function toLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(dateStr: string): string {
  const d = toLocalDate(dateStr)
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function DatePicker({ value, onChange, error }: DatePickerProps) {
  const today = new Date()
  const initial = toLocalDate(value) ?? today
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('days')
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [yearStart, setYearStart] = useState(() => Math.floor(initial.getFullYear() / YEAR_PAGE) * YEAR_PAGE)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setView('days')
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  // — Days view helpers —
  const firstDow = new Date(year, month, 1).getDay()
  const offset = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const rows = Math.ceil((offset + daysInMonth) / 7)

  const selectDay = (day: number) => {
    onChange(toDateString(new Date(year, month, day)))
    setOpen(false)
    setView('days')
  }
  const isSelected = (day: number) => {
    const d = toLocalDate(value)
    return d ? d.getFullYear() === year && d.getMonth() === month && d.getDate() === day : false
  }
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  // — Months view —
  const selectMonth = (m: number) => {
    setCursor(new Date(year, m, 1))
    setView('days')
  }

  // — Years view —
  const selectYear = (y: number) => {
    setCursor(new Date(y, month, 1))
    setView('months')
  }

  const handleHeaderClick = () => {
    if (view === 'days') {
      setYearStart(Math.floor(year / YEAR_PAGE) * YEAR_PAGE)
      setView('months')
    } else if (view === 'months') {
      setYearStart(Math.floor(year / YEAR_PAGE) * YEAR_PAGE)
      setView('years')
    } else {
      setView('days')
    }
  }

  const handlePrev = () => {
    if (view === 'days') setCursor(new Date(year, month - 1, 1))
    else if (view === 'months') setCursor(new Date(year - 1, month, 1))
    else setYearStart(y => y - YEAR_PAGE)
  }
  const handleNext = () => {
    if (view === 'days') setCursor(new Date(year, month + 1, 1))
    else if (view === 'months') setCursor(new Date(year + 1, month, 1))
    else setYearStart(y => y + YEAR_PAGE)
  }

  const headerLabel =
    view === 'days'
      ? `${MONTHS[month]} ${year}`
      : view === 'months'
      ? `${year}`
      : `${yearStart} – ${yearStart + YEAR_PAGE - 1}`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-1 transition-colors ${
          error
            ? 'border-red-400 focus:ring-red-400 text-gray-700'
            : 'border-gray-200 focus:ring-blue-500 text-gray-700'
        } ${value ? '' : 'text-gray-400'}`}
      >
        <span>{value ? formatDisplay(value) : 'Seleccionar fecha'}</span>
        <CalendarDays size={15} className="text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleHeaderClick}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors px-1"
            >
              {headerLabel}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days view */}
          {view === 'days' && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: rows * 7 }).map((_, i) => {
                  const day = i - offset + 1
                  const valid = day >= 1 && day <= daysInMonth
                  if (!valid) return <div key={i} />
                  const selected = isSelected(day)
                  const todayCell = isToday(day)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`w-8 h-8 mx-auto text-xs rounded-full flex items-center justify-center transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white font-semibold'
                          : todayCell
                          ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Months view */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS_SHORT.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(i)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    i === month && year === cursor.getFullYear()
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Years view */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: YEAR_PAGE }, (_, i) => yearStart + i).map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => selectYear(y)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    y === year
                      ? 'bg-blue-600 text-white'
                      : y === today.getFullYear()
                      ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
