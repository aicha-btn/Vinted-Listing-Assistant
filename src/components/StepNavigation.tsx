type WorkflowStep = 1 | 2 | 3

interface StepNavigationProps {
  currentStep: WorkflowStep
  hasListing: boolean
  historyCount: number
  onStepChange: (step: WorkflowStep) => void
}

const steps: Array<{ id: WorkflowStep; title: string; helper: string }> = [
  {
    id: 1,
    title: 'Produit',
    helper: 'Tu renseignes l’article',
  },
  {
    id: 2,
    title: 'Annonce',
    helper: 'Tu copies le résultat',
  },
  {
    id: 3,
    title: 'Historique',
    helper: 'Tu retrouves tes brouillons',
  },
]

export default function StepNavigation({
  currentStep,
  hasListing,
  historyCount,
  onStepChange,
}: StepNavigationProps) {
  return (
    <nav className="step-nav" aria-label="Étapes">
      {steps.map((step) => {
        const isActive = currentStep === step.id
        const isDone = step.id === 1 ? hasListing : currentStep > step.id
        const badge =
          step.id === 2
            ? hasListing
              ? 'Prête'
              : 'À générer'
            : step.id === 3
              ? `${historyCount}`
              : isDone
                ? 'OK'
                : '1'

        return (
          <button
            key={step.id}
            className={`step-card${isActive ? ' step-card-active' : ''}`}
            type="button"
            onClick={() => onStepChange(step.id)}
          >
            <span className="step-index">{step.id}</span>
            <span className="step-content">
              <span className="step-title">{step.title}</span>
              <span className="step-helper">{step.helper}</span>
            </span>
            <span className="step-badge">{badge}</span>
          </button>
        )
      })}
    </nav>
  )
}
