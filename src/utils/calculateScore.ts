import type {
  GeneratedListing,
  ProductFormData,
  QualityScoreResult,
} from '../types/listing'

const getScoreLabel = (score: number): QualityScoreResult['label'] => {
  if (score >= 90) {
    return 'excellent'
  }

  if (score >= 70) {
    return 'bon'
  }

  if (score >= 50) {
    return 'correct'
  }

  return 'faible'
}

export function calculateScore(
  formData: ProductFormData,
  listing: Pick<GeneratedListing, 'title' | 'detailedDescription' | 'hashtags'>,
) {
  let score = 0
  const details: string[] = []

  if (listing.title.trim().split(/\s+/).length >= 5) {
    score += 20
    details.push('Titre suffisamment complet.')
  }

  if (formData.etat) {
    score += 20
    details.push('État du produit bien renseigné.')
  }

  if (formData.taille.trim()) {
    score += 15
    details.push('Taille clairement indiquée.')
  }

  if (
    formData.defaut.trim() ||
    listing.detailedDescription.toLowerCase().includes('aucun défaut notable')
  ) {
    score += 15
    details.push('Défaut indiqué ou absence de défaut mentionnée.')
  }

  if (Number(formData.prix) > 0) {
    score += 10
    details.push('Prix renseigné dans le formulaire.')
  }

  if (listing.hashtags.length > 0) {
    score += 10
    details.push('Hashtags générés automatiquement.')
  }

  if (listing.detailedDescription.length > 250) {
    score += 10
    details.push('Description détaillée suffisamment riche.')
  }

  return {
    score,
    label: getScoreLabel(score),
    details,
  } satisfies QualityScoreResult
}
