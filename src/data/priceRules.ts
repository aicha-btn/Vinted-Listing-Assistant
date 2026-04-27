import type { ListingObjective, PricePositioning, ProductCondition } from '../types/listing'

export const priceBaseByCategory: Record<string, { min: number; max: number }> = {
  'robes-jupes': { min: 12, max: 30 },
  'tops-chemises': { min: 10, max: 24 },
  'jeans-pantalons': { min: 14, max: 35 },
  'vestes-manteaux': { min: 22, max: 65 },
  chaussures: { min: 20, max: 55 },
  sacs: { min: 18, max: 48 },
  accessoires: { min: 8, max: 22 },
  objets: { min: 10, max: 28 },
  default: { min: 10, max: 25 },
}

export const conditionMultipliers: Record<ProductCondition, number> = {
  'new-with-tags': 1.2,
  'very-good': 1,
  good: 0.82,
  correct: 0.65,
}

export const objectiveMultipliers: Record<
  ListingObjective,
  { min: number; max: number; positioning: PricePositioning }
> = {
  'fast-sale': { min: 0.9, max: 0.96, positioning: 'fast-sale' },
  'best-price': { min: 1, max: 1.08, positioning: 'balanced' },
  neutral: { min: 0.97, max: 1.03, positioning: 'balanced' },
  premium: { min: 1.05, max: 1.15, positioning: 'ambitious' },
}
