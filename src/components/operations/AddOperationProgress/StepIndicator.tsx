import type { StepId } from './operation.types'

interface StepIndicatorProps {
  currentStep: StepId
  skippedSteps: StepId[]
}

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: 'Operación' },
  { id: 2, label: 'Partes' },
  { id: 3, label: 'Resumen' },
]

export default function StepIndicator({ currentStep, skippedSteps }: StepIndicatorProps) {
  const isCompleted = (stepId: StepId) =>
    currentStep > stepId || (skippedSteps.includes(stepId) && currentStep === 3)

  const isActive = (stepId: StepId) => currentStep === stepId

  return (
    <div className="flex items-start justify-center mb-5">
      {STEPS.map((s, index) => {
        const completed = isCompleted(s.id)
        const active = isActive(s.id)
        const prevCompleted = index > 0 && isCompleted(STEPS[index - 1].id)

        return (
          <div key={s.id} className="flex items-start">
            {index > 0 && (
              <div className="pt-4 w-12 flex-shrink-0">
                <div className={`h-0.5 w-full ${prevCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
              </div>
            )}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : active
                    ? 'border-green-600 text-green-600 bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {completed ? '✓' : s.id}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  completed || active ? 'text-green-600 font-medium' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
