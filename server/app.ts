import type { GoogleGenAI } from '@google/genai'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import {
  generateGeminiListingPatch,
  GeminiProviderError,
  GeminiTimeoutError,
  InvalidGeminiResponseError,
} from './gemini'
import type { GeminiListingPatch, ImproveListingRequest } from './validation'
import { improveListingRequestSchema } from './validation'

export const JSON_BODY_LIMIT = '32kb'
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000
export const RATE_LIMIT_MAX_REQUESTS = 10

type ListingPatchGenerator = (
  ai: GoogleGenAI,
  model: string,
  prompt: ImproveListingRequest['prompt'],
) => Promise<GeminiListingPatch>

type CreateAppOptions = {
  ai: GoogleGenAI | null
  model: string
  generateListingPatch?: ListingPatchGenerator
}

export function createApp({
  ai,
  model,
  generateListingPatch = generateGeminiListingPatch,
}: CreateAppOptions) {
  const app = express()

  app.use(express.json({ limit: JSON_BODY_LIMIT }))

  const improveListingRateLimit = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: { error: 'Trop de requêtes. Réessaie plus tard.' },
  })

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.post('/api/improve-listing', improveListingRateLimit, async (request, response) => {
    const parsedRequest = improveListingRequestSchema.safeParse(request.body)

    if (!parsedRequest.success) {
      response.status(400).json({ error: 'Requête invalide.' })
      return
    }

    if (!ai) {
      response.status(503).json({ error: 'Service IA indisponible.' })
      return
    }

    try {
      const listingPatch = await generateListingPatch(
        ai,
        model,
        parsedRequest.data.prompt,
      )

      response.json({
        provider: 'gemini',
        providerLabel: `Gemini (${model})`,
        mode: 'provider',
        listingPatch,
      })
    } catch (error) {
      const errorType = error instanceof Error ? error.name : 'UnknownError'
      console.error('Gemini request failed.', { errorType })

      if (error instanceof GeminiTimeoutError) {
        response.status(504).json({ error: 'Le service IA a mis trop de temps à répondre.' })
        return
      }

      if (
        error instanceof GeminiProviderError ||
        error instanceof InvalidGeminiResponseError
      ) {
        response.status(502).json({ error: 'Le service IA a renvoyé une réponse invalide.' })
        return
      }

      response.status(500).json({ error: 'Erreur interne.' })
    }
  })

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      next: express.NextFunction,
    ) => {
      if (response.headersSent) {
        next(error)
        return
      }

      const requestError = error as { status?: number; type?: string }

      if (requestError.type === 'entity.too.large' || requestError.status === 413) {
        response.status(413).json({ error: 'Requête trop volumineuse.' })
        return
      }

      if (error instanceof SyntaxError) {
        response.status(400).json({ error: 'Requête invalide.' })
        return
      }

      console.error('Unexpected server error.', {
        errorType: error instanceof Error ? error.name : 'UnknownError',
      })
      response.status(500).json({ error: 'Erreur interne.' })
    },
  )

  return app
}
