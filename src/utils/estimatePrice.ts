import {
  conditionMultipliers,
  objectiveMultipliers,
  priceBaseByCategory,
} from '../data/priceRules'
import type { PriceEstimate, ProductFormData } from '../types/listing'

const roundPrice = (value: number) => Math.max(3, Math.round(value))

export function estimatePrice(formData: ProductFormData): PriceEstimate {
  const baseRule =
    priceBaseByCategory[formData.categorie] ?? priceBaseByCategory.default
  const conditionMultiplier = formData.etat
    ? conditionMultipliers[formData.etat]
    : 0.9
  const objectiveRule = objectiveMultipliers[formData.objectif]
  const brandMultiplier = formData.marque.trim() ? 1.12 : 1

  const suggestedMin = roundPrice(
    baseRule.min * conditionMultiplier * brandMultiplier * objectiveRule.min,
  )
  const suggestedMax = roundPrice(
    baseRule.max * conditionMultiplier * brandMultiplier * objectiveRule.max,
  )

  const currentPrice = Number(formData.prix)

  let advice: string

  if (Number.isFinite(currentPrice) && currentPrice > 0) {
    if (currentPrice < suggestedMin) {
      advice =
        'Ton prix actuel est plutôt bas par rapport à la fourchette : pratique pour vendre vite.'
    } else if (currentPrice > suggestedMax) {
      advice =
        'Ton prix actuel est au-dessus de la fourchette conseillée : pense à renforcer les photos et la description.'
    } else {
      advice =
        'Ton prix actuel reste cohérent avec la fourchette conseillée : bon équilibre pour publier sereinement.'
    }
  } else if (objectiveRule.positioning === 'fast-sale') {
    advice = 'Conseil vente rapide : place-toi vers le bas de la fourchette.'
  } else if (objectiveRule.positioning === 'ambitious') {
    advice = 'Conseil prix ambitieux : commence plutôt vers le haut de la fourchette.'
  } else {
    advice = 'Conseil prix équilibré : vise le milieu de la fourchette.'
  }

  return {
    suggestedMin,
    suggestedMax,
    positioning: objectiveRule.positioning,
    advice,
  }
}
