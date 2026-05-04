import {
  categoryLabels,
  categoryPhotoTips,
  closingSignature,
  conditionLabels,
  objectiveToneGuides,
  publicationChecklistBase,
  seasonLabels,
  styleLabels,
} from '../data/templates'
import type { GeneratedListing, ProductFormData } from '../types/listing'
import { calculateScore } from './calculateScore'
import { estimatePrice } from './estimatePrice'
import { generateHashtags } from './generateHashtags'
import { buildFullListingText } from './listingFormatting'
import { capitalize, compactText } from './text'

const formatPrice = (value: string) =>
  Number(value) > 0 ? `${Number(value)} €` : 'non renseigné'

const buildTitle = (
  formData: ProductFormData,
  conditionLabel: string,
  titleAccent: string,
) => {
  const titleCore = compactText(
    [
      capitalize(formData.marque),
      formData.typeArticle,
      formData.taille ? `taille ${formData.taille}` : '',
      formData.couleur,
    ]
      .filter(Boolean)
      .join(' '),
  )

  return compactText([titleCore, conditionLabel, titleAccent].filter(Boolean).join(' - '))
}

const buildDetailedDescription = (
  formData: ProductFormData,
  labels: {
    brand: string
    category: string
    season: string
    style: string
    condition: string
  },
  suggestedRangeText: string,
  detailLead: string,
  closing: string,
) => {
  const defectSentence = formData.defaut.trim()
    ? `Défaut à noter : ${compactText(formData.defaut)}.`
    : 'Aucun défaut notable à signaler.'
  const materialSentence = formData.matiere.trim()
    ? `Matière mentionnée : ${compactText(formData.matiere)}.`
    : ''

  return [
    `${capitalize(formData.typeArticle)} ${labels.brand} dans la catégorie ${labels.category.toLowerCase()}.`,
    `Couleur ${formData.couleur}, taille ${formData.taille}, style ${labels.style.toLowerCase()}, idéale pour ${labels.season.toLowerCase()}.`,
    `État : ${labels.condition}. ${defectSentence}`,
    materialSentence,
    `Prix actuellement saisi : ${formatPrice(formData.prix)}.`,
    suggestedRangeText,
    detailLead,
    closing,
    closingSignature,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function generateListing(formData: ProductFormData): GeneratedListing {
  const toneGuide = objectiveToneGuides[formData.objectif]
  const brandLabel = formData.marque.trim() || 'sans marque précisée'
  const conditionLabel = formData.etat
    ? conditionLabels[formData.etat]
    : 'État non précisé'
  const categoryLabel = categoryLabels[formData.categorie] || 'Article mode'
  const seasonLabel = seasonLabels[formData.saison] || 'Toute saison'
  const styleLabel = styleLabels[formData.style] || 'facile à porter'
  const priceEstimate = estimatePrice(formData)
  const hashtags = generateHashtags(formData)
  const title = buildTitle(formData, conditionLabel, toneGuide.titleAccent)

  const shortDescription = compactText(
    `${capitalize(formData.typeArticle)} ${brandLabel} en ${formData.couleur}, taille ${formData.taille}. ${conditionLabel}. ${toneGuide.shortLead}`,
  )

  const detailedDescription = buildDetailedDescription(
    formData,
    {
      brand: brandLabel,
      category: categoryLabel,
      season: seasonLabel,
      style: styleLabel,
      condition: conditionLabel,
    },
    `Fourchette conseillée : ${priceEstimate.suggestedMin} € à ${priceEstimate.suggestedMax} €.`,
    toneGuide.detailLead,
    toneGuide.closing,
  )

  const photoTips = [
    ...(categoryPhotoTips[formData.categorie] ?? categoryPhotoTips.objets),
    formData.defaut.trim()
      ? 'Ajouter une photo nette du défaut pour rester transparente.'
      : 'Prévoir un plan détaillé d’une couture ou de la texture pour rassurer.',
  ]

  const photoChecklist = [
    'Photo face',
    'Photo dos',
    'Photo étiquette taille',
    formData.defaut.trim()
      ? 'Photo du défaut'
      : 'Photo détail de la matière ou des finitions',
    'Photo portée ou mise en scène si possible',
  ]

  const publicationChecklist = [
    ...publicationChecklistBase,
    'Vérifier que le premier visuel est le plus vendeur.',
    'Comparer le prix final avec la fourchette conseillée avant publication.',
  ]

  const qualityScore = calculateScore(formData, {
    title,
    detailedDescription,
    hashtags,
  })

  const fullText = buildFullListingText({
    title,
    shortDescription,
    detailedDescription,
    hashtags,
    priceEstimate,
  })

  return {
    id: `listing-${Date.now()}`,
    title,
    shortDescription,
    detailedDescription,
    hashtags,
    priceEstimate,
    photoTips,
    photoChecklist,
    publicationChecklist,
    qualityScore,
    fullText,
    createdAt: new Date().toISOString(),
  }
}
