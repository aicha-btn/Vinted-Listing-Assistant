export type ListingObjective = 'fast-sale' | 'best-price' | 'neutral' | 'premium'

export type ListingStatus = 'draft' | 'published' | 'sold'

export type ProductCondition =
  | 'new-with-tags'
  | 'very-good'
  | 'good'
  | 'correct'

export type PricePositioning = 'fast-sale' | 'balanced' | 'ambitious'
export type ListingSource = 'rules' | 'ai-simulated' | 'ai-provider'

export interface ProductFormData {
  typeArticle: string
  marque: string
  taille: string
  couleur: string
  etat: ProductCondition | ''
  defaut: string
  prix: string
  categorie: string
  saison: string
  style: string
  objectif: ListingObjective
  matiere: string
}

export interface PriceEstimate {
  suggestedMin: number
  suggestedMax: number
  positioning: PricePositioning
  advice: string
}

export interface QualityScoreResult {
  score: number
  label: 'faible' | 'correct' | 'bon' | 'excellent'
  details: string[]
}

export interface GeneratedListing {
  id: string
  title: string
  shortDescription: string
  detailedDescription: string
  hashtags: string[]
  priceEstimate: PriceEstimate
  photoTips: string[]
  photoChecklist: string[]
  publicationChecklist: string[]
  qualityScore: QualityScoreResult
  fullText: string
  createdAt: string
  source?: ListingSource
  providerLabel?: string
}

export interface SavedListing {
  id: string
  status: ListingStatus
  savedAt: string
  formData: ProductFormData
  listing: GeneratedListing
}
