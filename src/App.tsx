import { useEffect, useRef, useState } from 'react'
import GeneratedListingPanel from './components/GeneratedListing'
import ListingHistory from './components/ListingHistory'
import ProductForm from './components/ProductForm'
import StepNavigation from './components/StepNavigation'
import { initialProductFormData } from './data/templates'
import { improveListingWithAi } from './services/aiService'
import type { AiImprovementResult, AiResultStatus } from './types/ai'
import type {
  GeneratedListing,
  ListingStatus,
  ProductFormData,
  SavedListing,
} from './types/listing'
import { validateProductForm, type ProductFormErrors } from './utils/formValidation'
import { generateListing } from './utils/generateListing'
import {
  addStoredListing,
  getStoredListings,
  removeStoredListing,
  updateStoredListingStatus,
} from './utils/storage'

type WorkflowStep = 1 | 2 | 3
type ListingVariant = 'rules' | 'ai'

function App() {
  const [formData, setFormData] = useState<ProductFormData>(initialProductFormData)
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(
    null,
  )
  const [aiImprovement, setAiImprovement] = useState<AiImprovementResult | null>(null)
  const [aiStatus, setAiStatus] = useState<AiResultStatus>('idle')
  const [aiError, setAiError] = useState<string | null>(null)
  const [activeVariant, setActiveVariant] = useState<ListingVariant>('rules')
  const [history, setHistory] = useState<SavedListing[]>(() => getStoredListings())
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1)
  const feedbackTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  const showFeedback = (message: string) => {
    setFeedbackMessage(message)

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current)
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackMessage(null)
    }, 2400)
  }

  const handleFieldChange = (field: keyof ProductFormData, value: string) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [field]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
  }

  const resetAiState = () => {
    setAiImprovement(null)
    setAiStatus('idle')
    setAiError(null)
    setActiveVariant('rules')
  }

  const handleGenerate = () => {
    const nextErrors = validateProductForm(formData)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      showFeedback('Complète les champs essentiels avant de générer.')
      return
    }

    const listing = generateListing(formData)
    setGeneratedListing(listing)
    resetAiState()
    setCurrentStep(2)
    showFeedback('Annonce générée.')
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showFeedback('Contenu copié.')
    } catch {
      showFeedback('La copie a échoué dans ce navigateur.')
    }
  }

  const handleSave = () => {
    const listingToSave =
      activeVariant === 'ai' && aiImprovement ? aiImprovement.listing : generatedListing

    if (!listingToSave) {
      return
    }

    const existingEntry = history.find((entry) => entry.id === listingToSave.id)

    const nextEntry: SavedListing = {
      id: listingToSave.id,
      status: existingEntry?.status ?? 'draft',
      savedAt: new Date().toISOString(),
      formData,
      listing: listingToSave,
    }

    const updatedHistory = addStoredListing(nextEntry)
    setHistory(updatedHistory)
    showFeedback('Annonce sauvegardée.')
  }

  const handleLoad = (entry: SavedListing) => {
    setFormData(entry.formData)
    setGeneratedListing(entry.listing)
    resetAiState()
    setErrors({})
    setCurrentStep(2)
    showFeedback('Annonce rechargée.')
  }

  const handleDelete = (id: string) => {
    const updatedHistory = removeStoredListing(id)
    setHistory(updatedHistory)

    if (generatedListing?.id === id) {
      setGeneratedListing(null)
      setCurrentStep(1)
    }

    showFeedback('Annonce supprimée.')
  }

  const handleStatusChange = (id: string, status: ListingStatus) => {
    const updatedHistory = updateStoredListingStatus(id, status)
    setHistory(updatedHistory)
  }

  const handleImproveWithAi = async () => {
    if (!generatedListing) {
      return
    }

    setAiStatus('loading')
    setAiError(null)

    try {
      const result = await improveListingWithAi({
        formData,
        baseListing: generatedListing,
      })

      setAiImprovement(result)
      setAiStatus('success')
      setActiveVariant('ai')
      showFeedback('Version IA prête.')
    } catch (error) {
      setAiStatus('error')
      setAiError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'amélioration IA.",
      )
    }
  }

  const activeListing =
    activeVariant === 'ai' && aiImprovement ? aiImprovement.listing : generatedListing

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-surface">
          <div className="brand-lockup">
            <span className="brand-mark">V</span>
            <div>
              <p className="brand-name">Vintedito</p>
              <p className="brand-subtitle">Assistant d'annonces Vinted</p>
            </div>
          </div>
          <nav className="topbar-nav" aria-label="Navigation principale">
            <span className="topbar-link">Générateur</span>
            <span className="topbar-link">Historique</span>
            <span className="topbar-badge">Gemini + local</span>
          </nav>
        </div>
      </header>

      <section className="hero-card">
        <div className="hero-copy-block">
          <p className="eyebrow">Vintedito</p>
          <h1>Génère une annonce propre, vite, sans te perdre dans l'écran.</h1>
          <p className="hero-copy">
            Tu remplis ton produit, tu génères ton annonce, puis tu l'améliores
            avec Gemini si tu veux. Le tout en 3 étapes simples.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">Titre optimisé</span>
            <span className="hero-pill">Prix conseillé</span>
            <span className="hero-pill">Historique local</span>
          </div>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="hero-preview-bar">
            <span className="hero-dot" />
            <span className="hero-dot" />
            <span className="hero-dot" />
          </div>
          <div className="hero-preview-card">
            <span className="hero-preview-label">Étape 1</span>
            <strong>Produit</strong>
            <p>Les infos essentielles pour lancer l'annonce.</p>
          </div>
          <div className="hero-preview-card hero-preview-card-highlight">
            <span className="hero-preview-label">Étape 2</span>
            <strong>Annonce</strong>
            <p>Version maison, copie rapide, amélioration IA.</p>
          </div>
          <div className="hero-preview-card">
            <span className="hero-preview-label">Étape 3</span>
            <strong>Historique</strong>
            <p>Recharge et réutilise tes annonces sauvegardées.</p>
          </div>
        </div>
      </section>

      <StepNavigation
        currentStep={currentStep}
        hasListing={Boolean(generatedListing)}
        historyCount={history.length}
        onStepChange={setCurrentStep}
      />

      {feedbackMessage ? (
        <p className="global-feedback" role="status">
          {feedbackMessage}
        </p>
      ) : null}

      <main className="workflow-shell">
        {currentStep === 1 ? (
          <ProductForm
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSubmit={handleGenerate}
            onOpenHistory={() => setCurrentStep(3)}
            savedCount={history.length}
          />
        ) : null}

        {currentStep === 2 ? (
          <GeneratedListingPanel
            key={generatedListing?.id ?? 'empty-listing'}
            listing={generatedListing}
            activeListing={activeListing}
            aiImprovement={aiImprovement}
            aiStatus={aiStatus}
            aiError={aiError}
            activeVariant={activeVariant}
            onCopy={handleCopy}
            onSave={handleSave}
            onImproveWithAi={handleImproveWithAi}
            onSelectVariant={(variant) => setActiveVariant(variant)}
            onBackToForm={() => setCurrentStep(1)}
            onOpenHistory={() => setCurrentStep(3)}
          />
        ) : null}

        {currentStep === 3 ? (
          <ListingHistory
            entries={history}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onCreateNew={() => setCurrentStep(1)}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
