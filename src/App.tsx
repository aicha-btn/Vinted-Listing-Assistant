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
import { generateListing } from './utils/generateListing'
import {
  addStoredListing,
  getStoredListings,
  removeStoredListing,
  updateStoredListingStatus,
} from './utils/storage'

type FormErrors = Partial<Record<keyof ProductFormData, string>>

const requiredLabels: Partial<Record<keyof ProductFormData, string>> = {
  typeArticle: 'Le type d’article est requis.',
  categorie: 'La catégorie est requise.',
  taille: 'La taille est requise.',
  couleur: 'La couleur est requise.',
  etat: 'L’état est requis.',
}

const validateFormData = (formData: ProductFormData) => {
  const nextErrors: FormErrors = {}

  ;(Object.keys(requiredLabels) as Array<keyof typeof requiredLabels>).forEach(
    (field) => {
      if (!formData[field]?.trim()) {
        nextErrors[field] = requiredLabels[field]
      }
    },
  )

  if (formData.prix && Number(formData.prix) < 0) {
    nextErrors.prix = 'Le prix ne peut pas être négatif.'
  }

  return nextErrors
}

function App() {
  const [formData, setFormData] = useState<ProductFormData>(initialProductFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(
    null,
  )
  const [aiImprovement, setAiImprovement] = useState<AiImprovementResult | null>(null)
  const [aiStatus, setAiStatus] = useState<AiResultStatus>('idle')
  const [aiError, setAiError] = useState<string | null>(null)
  const [activeVariant, setActiveVariant] = useState<'rules' | 'ai'>('rules')
  const [history, setHistory] = useState<SavedListing[]>(() => getStoredListings())
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
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

  const handleGenerate = () => {
    const nextErrors = validateFormData(formData)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      showFeedback('Complète les champs essentiels avant de générer.')
      return
    }

    const listing = generateListing(formData)
    setGeneratedListing(listing)
    setAiImprovement(null)
    setAiStatus('idle')
    setAiError(null)
    setActiveVariant('rules')
    setCurrentStep(2)
    showFeedback('Annonce générée.')
  }

  const handleCopy = async (_action: string, value: string) => {
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
    setAiImprovement(null)
    setAiStatus('idle')
    setAiError(null)
    setActiveVariant('rules')
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
        <div className="brand-lockup">
          <span className="brand-mark">V</span>
          <div>
            <p className="brand-name">Vinted Listing Assistant</p>
            <p className="brand-subtitle">Moteur maison + IA optionnelle</p>
          </div>
        </div>
        <span className="topbar-badge">Version V2</span>
      </header>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Créer une annonce en 3 étapes</p>
          <h1>Un parcours plus simple, plus clair, plus rapide.</h1>
          <p className="hero-copy">
            Tu remplis ton produit. Tu génères la base. Tu peux ensuite l’améliorer
            avec l’IA si tu veux.
          </p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>1</strong>
            <span>Produit</span>
          </div>
          <div className="hero-stat">
            <strong>2</strong>
            <span>Annonce</span>
          </div>
          <div className="hero-stat">
            <strong>3</strong>
            <span>Historique</span>
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
            onSelectVariant={setActiveVariant}
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
