import { z } from 'zod'

const requiredText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength)

const optionalText = (maxLength: number) => z.string().trim().max(maxLength)

const stringList = (itemMaxLength: number, maxItems: number) =>
  z.array(requiredText(itemMaxLength)).max(maxItems)

const productFormSchema = z
  .object({
    typeArticle: requiredText(120),
    marque: optionalText(80),
    taille: requiredText(40),
    couleur: requiredText(60),
    etat: z.enum(['new-with-tags', 'very-good', 'good', 'correct']),
    defaut: optionalText(600),
    prix: optionalText(20).refine(
      (value) => value === '' || (/^\d+(?:[.,]\d{1,2})?$/.test(value) && Number(value.replace(',', '.')) <= 100_000),
    ),
    categorie: z.enum([
      'robes-jupes',
      'tops-chemises',
      'jeans-pantalons',
      'vestes-manteaux',
      'chaussures',
      'sacs',
      'accessoires',
      'objets',
    ]),
    saison: z.enum(['', 'printemps', 'ete', 'automne', 'hiver', 'toute-saison']),
    style: z.enum([
      '',
      'casual',
      'minimaliste',
      'boheme',
      'streetwear',
      'chic',
      'sport',
      'vintage',
    ]),
    objectif: z.enum(['fast-sale', 'best-price', 'neutral', 'premium']),
    matiere: optionalText(100),
  })
  .strict()

const generatedListingSchema = z
  .object({
    id: requiredText(120),
    title: requiredText(240),
    shortDescription: requiredText(800),
    detailedDescription: requiredText(6_000),
    hashtags: stringList(80, 20),
    priceEstimate: z
      .object({
        suggestedMin: z.number().finite().min(0).max(100_000),
        suggestedMax: z.number().finite().min(0).max(100_000),
        positioning: z.enum(['fast-sale', 'balanced', 'ambitious']),
        advice: requiredText(1_000),
      })
      .strict(),
    photoTips: stringList(500, 12),
    photoChecklist: stringList(500, 12),
    publicationChecklist: stringList(500, 12),
    qualityScore: z
      .object({
        score: z.number().int().min(0).max(100),
        label: z.enum(['faible', 'correct', 'bon', 'excellent']),
        details: stringList(500, 20),
      })
      .strict(),
    fullText: requiredText(10_000),
    createdAt: z.string().datetime(),
    source: z.enum(['rules', 'ai-simulated', 'ai-provider']).optional(),
    providerLabel: optionalText(100).optional(),
  })
  .strict()

export const improveListingRequestSchema = z
  .object({
    provider: z.literal('gemini').optional(),
    prompt: z
      .object({
        systemPrompt: requiredText(2_000),
        userPrompt: requiredText(16_000),
      })
      .strict(),
    formData: productFormSchema,
    listing: generatedListingSchema,
  })
  .strict()

export type ImproveListingRequest = z.infer<typeof improveListingRequestSchema>

export const geminiListingPatchSchema = z
  .object({
    title: requiredText(240),
    shortDescription: requiredText(800),
    detailedDescription: requiredText(6_000),
    hashtags: stringList(80, 20),
    photoTips: stringList(500, 12),
  })
  .strict()

export type GeminiListingPatch = z.infer<typeof geminiListingPatchSchema>
