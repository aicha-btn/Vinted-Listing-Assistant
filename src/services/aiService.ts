import { calculateScore } from '../utils/calculateScore'
import type {
  AiImprovementRequest,
  AiImprovementResult,
  AiPromptBundle,
  AiProvider,
  AiProviderClient,
} from '../types/ai'
import type { GeneratedListing, ProductFormData } from '../types/listing'

const runtimeEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>
}).env ?? {}

const AI_MODE = runtimeEnv.VITE_AI_MODE ?? 'simulation'
const AI_PROVIDER = (runtimeEnv.VITE_AI_PROVIDER as AiProvider | undefined) ?? 'simulation'
const AI_BACKEND_URL = runtimeEnv.VITE_AI_BACKEND_URL ?? ''

const providerLabels: Record<AiProvider, string> = {
  simulation: 'Simulation IA',
  gemini: 'Gemini',
  groq: 'Groq',
  deepseek: 'DeepSeek',
  openrouter: 'OpenRouter',
}

const objectiveSalesLines: Record<ProductFormData['objectif'], string> = {
  'fast-sale': 'Annonce fluide et rassurante pour aider à vendre vite.',
  'best-price': 'Annonce plus valorisante pour mieux défendre le prix.',
  neutral: 'Annonce claire, simple et directe.',
  premium: 'Annonce plus soignée pour donner davantage envie.',
}

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value

const cleanSentence = (value: string) => value.replace(/\s+/g, ' ').trim()

const dedupeHashtags = (hashtags: string[]) => Array.from(new Set(hashtags)).slice(0, 10)

const buildImprovedTitle = (
  formData: ProductFormData,
  baseListing: GeneratedListing,
) => {
  const emphasisByObjective: Record<ProductFormData['objectif'], string> = {
    'fast-sale': 'petit prix',
    'best-price': 'belle opportunité',
    neutral: 'annonce soignée',
    premium: 'pièce coup de cœur',
  }

  const title = [
    formData.marque.trim(),
    formData.typeArticle.trim(),
    formData.taille.trim() ? `taille ${formData.taille.trim()}` : '',
    formData.couleur.trim(),
    baseListing.title.includes('Très bon état')
      ? 'Très bon état'
      : baseListing.title.includes('Bon état')
        ? 'Bon état'
        : '',
    emphasisByObjective[formData.objectif],
  ]
    .filter(Boolean)
    .join(' - ')

  return cleanSentence(title)
}

const buildImprovedShortDescription = (formData: ProductFormData) => {
  const defectLine = formData.defaut.trim()
    ? `Défaut signalé : ${cleanSentence(formData.defaut)}.`
    : 'Aucun défaut notable signalé.'

  return cleanSentence(
    `${capitalize(formData.typeArticle)} ${formData.marque.trim() || 'sans marque précisée'} en ${formData.couleur}. Taille ${formData.taille}. ${defectLine} ${objectiveSalesLines[formData.objectif]}`,
  )
}

const buildImprovedDetailedDescription = (
  formData: ProductFormData,
  baseListing: GeneratedListing,
) => {
  const lines = [
    `${capitalize(formData.typeArticle)} ${formData.marque.trim() || 'sans marque précisée'}, taille ${formData.taille}, couleur ${formData.couleur}.`,
    formData.matiere.trim()
      ? `Matière : ${cleanSentence(formData.matiere)}.`
      : 'La matière n’est pas précisée, mais la pièce est décrite avec transparence.',
    formData.defaut.trim()
      ? `À noter : ${cleanSentence(formData.defaut)}.`
      : 'Aucun défaut notable à signaler.',
    `Prix conseillé : ${baseListing.priceEstimate.suggestedMin} € à ${baseListing.priceEstimate.suggestedMax} €.`,
    objectiveSalesLines[formData.objectif],
    'Envoi rapide, emballage soigné, discussion possible si besoin.',
  ]

  return lines.join('\n\n')
}

const buildImprovedPhotoTips = (
  formData: ProductFormData,
  baseListing: GeneratedListing,
) => {
  const extraTip = formData.defaut.trim()
    ? 'Ajoute un gros plan du défaut pour rassurer immédiatement.'
    : 'Ajoute un gros plan du tissu ou des finitions pour inspirer confiance.'

  return Array.from(new Set([...baseListing.photoTips, extraTip])).slice(0, 4)
}

const buildImprovedHashtags = (
  formData: ProductFormData,
  baseListing: GeneratedListing,
) => {
  const extrasByObjective: Record<ProductFormData['objectif'], string[]> = {
    'fast-sale': ['#petitprix', '#bonplanmode'],
    'best-price': ['#bellepiece', '#secondemain'],
    neutral: ['#annonceclaire', '#vintedfr'],
    premium: ['#piecetendance', '#dressingselection'],
  }

  return dedupeHashtags([
    ...baseListing.hashtags,
    ...extrasByObjective[formData.objectif],
  ])
}

const buildFullText = (listing: GeneratedListing) =>
  [
    `Titre : ${listing.title}`,
    `Description courte : ${listing.shortDescription}`,
    'Description détaillée :',
    listing.detailedDescription,
    `Hashtags : ${listing.hashtags.join(' ')}`,
    `Prix conseillé : ${listing.priceEstimate.suggestedMin} € - ${listing.priceEstimate.suggestedMax} €`,
  ].join('\n\n')

const buildProviderListing = (
  request: AiImprovementRequest,
  patch: Partial<{
    title: string
    shortDescription: string
    detailedDescription: string
    hashtags: string[]
    photoTips: string[]
  }>,
  providerLabel: string,
): GeneratedListing => {
  const title = patch.title?.trim() || request.baseListing.title
  const shortDescription =
    patch.shortDescription?.trim() || request.baseListing.shortDescription
  const detailedDescription =
    patch.detailedDescription?.trim() || request.baseListing.detailedDescription
  const hashtags = dedupeHashtags(
    patch.hashtags?.length ? patch.hashtags : request.baseListing.hashtags,
  )
  const photoTips =
    patch.photoTips && patch.photoTips.length > 0
      ? patch.photoTips.slice(0, 4)
      : request.baseListing.photoTips
  const qualityScore = calculateScore(request.formData, {
    title,
    detailedDescription,
    hashtags,
  })

  return {
    ...request.baseListing,
    title,
    shortDescription,
    detailedDescription,
    hashtags,
    photoTips,
    qualityScore,
    fullText: buildFullText({
      ...request.baseListing,
      title,
      shortDescription,
      detailedDescription,
      hashtags,
    }),
    source: 'ai-provider',
    providerLabel,
  }
}

export function buildAiPrompt({
  formData,
  baseListing,
}: AiImprovementRequest): AiPromptBundle {
  return {
    systemPrompt:
      "Tu améliores une annonce Vinted. Sois humain, vendeur et concis. N'invente rien. Ne promets rien de mensonger. Mentionne clairement les défauts. Retourne un résultat structuré avec : titre, description courte, description détaillée, hashtags, conseils.",
    userPrompt: JSON.stringify(
      {
        produit: formData,
        annonceMaison: {
          title: baseListing.title,
          shortDescription: baseListing.shortDescription,
          detailedDescription: baseListing.detailedDescription,
          hashtags: baseListing.hashtags,
          photoTips: baseListing.photoTips,
        },
      },
      null,
      2,
    ),
  }
}

function createImprovedListing({
  formData,
  baseListing,
}: AiImprovementRequest): GeneratedListing {
  const title = buildImprovedTitle(formData, baseListing)
  const shortDescription = buildImprovedShortDescription(formData)
  const detailedDescription = buildImprovedDetailedDescription(formData, baseListing)
  const hashtags = buildImprovedHashtags(formData, baseListing)
  const photoTips = buildImprovedPhotoTips(formData, baseListing)
  const qualityScore = calculateScore(formData, {
    title,
    detailedDescription,
    hashtags,
  })

  return {
    ...baseListing,
    title,
    shortDescription,
    detailedDescription,
    hashtags,
    photoTips,
    qualityScore,
    fullText: buildFullText({
      ...baseListing,
      title,
      shortDescription,
      detailedDescription,
      hashtags,
    }),
    source: 'ai-simulated',
    providerLabel: 'Simulation IA',
  }
}

const simulationProvider: AiProviderClient = {
  provider: 'simulation',
  async improve(request) {
    const prompt = buildAiPrompt(request)

    await new Promise((resolve) => window.setTimeout(resolve, 900))

    return {
      provider: 'simulation',
      providerLabel: providerLabels.simulation,
      mode: 'simulation',
      prompt,
      listing: createImprovedListing(request),
    }
  },
}

const remoteProvider: AiProviderClient = {
  provider: AI_PROVIDER,
  async improve(request) {
    const prompt = buildAiPrompt(request)
    const baseUrl = AI_BACKEND_URL || ''

    const response = await fetch(`${baseUrl}/api/improve-listing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: AI_PROVIDER,
        prompt,
        formData: request.formData,
        listing: request.baseListing,
      }),
    })

    const data = (await response.json()) as {
      error?: string
      provider?: AiProvider
      providerLabel?: string
      mode?: 'provider'
      listingPatch?: Partial<{
        title: string
        shortDescription: string
        detailedDescription: string
        hashtags: string[]
        photoTips: string[]
      }>
    }

    if (!response.ok) {
      throw new Error(data.error || "Le service IA n'a pas répondu correctement.")
    }

    const providerLabel = data.providerLabel || providerLabels[AI_PROVIDER]

    return {
      provider: data.provider || AI_PROVIDER,
      providerLabel,
      mode: data.mode || 'provider',
      prompt,
      listing: buildProviderListing(request, data.listingPatch ?? {}, providerLabel),
    }
  },
}

export async function improveListingWithAi(
  request: AiImprovementRequest,
): Promise<AiImprovementResult> {
  const client = AI_MODE === 'simulation' || AI_PROVIDER === 'simulation'
    ? simulationProvider
    : remoteProvider

  return client.improve(request)
}

export function getAiRuntimeConfig() {
  return {
    mode: AI_MODE,
    provider: AI_PROVIDER,
    backendUrlConfigured: Boolean(AI_BACKEND_URL),
  }
}
