import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { GoogleGenAI } from '@google/genai'
import {
  generateGeminiListingPatch,
  GeminiProviderError,
  GeminiTimeoutError,
  InvalidGeminiResponseError,
} from './gemini'
import { improveListingRequestSchema } from './validation'

const PORT = Number(process.env.PORT ?? 8787)
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

const app = express()

app.use(express.json({ limit: '32kb' }))

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

const improveListingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
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
    const listingPatch = await generateGeminiListingPatch(
      ai,
      GEMINI_MODEL,
      parsedRequest.data.prompt,
    )

    response.json({
      provider: 'gemini',
      providerLabel: `Gemini (${GEMINI_MODEL})`,
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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Gemini server ready on http://127.0.0.1:${PORT}`)
})
