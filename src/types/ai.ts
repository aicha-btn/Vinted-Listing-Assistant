import type { GeneratedListing, ProductFormData } from './listing'

export type AiProvider = 'simulation' | 'gemini' | 'groq' | 'deepseek' | 'openrouter'

export type AiResultStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AiPromptBundle {
  systemPrompt: string
  userPrompt: string
}

export interface AiImprovementRequest {
  formData: ProductFormData
  baseListing: GeneratedListing
}

export interface AiImprovementResult {
  provider: AiProvider
  providerLabel: string
  mode: 'simulation' | 'provider'
  prompt: AiPromptBundle
  listing: GeneratedListing
}

export interface AiProviderClient {
  provider: AiProvider
  improve: (request: AiImprovementRequest) => Promise<AiImprovementResult>
}
