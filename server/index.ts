import 'dotenv/config'
import express from 'express'
import { GoogleGenAI } from '@google/genai'

const PORT = Number(process.env.PORT ?? 8787)
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'

const app = express()

app.use(express.json({ limit: '1mb' }))

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

const extractJson = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    throw new Error('Réponse vide de Gemini.')
  }

  const fencedMatch = trimmedValue.match(/```json\s*([\s\S]*?)```/i)
  const rawJson = fencedMatch ? fencedMatch[1].trim() : trimmedValue

  return JSON.parse(rawJson) as {
    title?: string
    shortDescription?: string
    detailedDescription?: string
    hashtags?: string[]
    photoTips?: string[]
  }
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    provider: 'gemini',
    configured: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL,
  })
})

app.post('/api/improve-listing', async (request, response) => {
  try {
    if (!ai) {
      response.status(500).json({
        error: 'GEMINI_API_KEY manquante côté serveur.',
      })
      return
    }

    const { prompt, formData, listing } = request.body as {
      prompt?: { systemPrompt?: string; userPrompt?: string }
      formData?: Record<string, unknown>
      listing?: Record<string, unknown>
    }

    if (!prompt?.systemPrompt || !prompt.userPrompt || !formData || !listing) {
      response.status(400).json({
        error: 'Requête IA incomplète.',
      })
      return
    }

    const geminiResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                prompt.userPrompt,
                '',
                'Retourne uniquement un JSON valide.',
                'Format attendu :',
                '{',
                '  "title": "string",',
                '  "shortDescription": "string",',
                '  "detailedDescription": "string",',
                '  "hashtags": ["#tag1", "#tag2"],',
                '  "photoTips": ["conseil 1", "conseil 2"]',
                '}',
              ].join('\n'),
            },
          ],
        },
      ],
      config: {
        systemInstruction: prompt.systemPrompt,
        temperature: 0.6,
      },
    })

    const text = geminiResponse.text ?? ''
    const parsed = extractJson(text)

    response.json({
      provider: 'gemini',
      providerLabel: `Gemini (${GEMINI_MODEL})`,
      mode: 'provider',
      listingPatch: {
        title: parsed.title,
        shortDescription: parsed.shortDescription,
        detailedDescription: parsed.detailedDescription,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        photoTips: Array.isArray(parsed.photoTips) ? parsed.photoTips : [],
      },
    })
  } catch (error) {
    response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de l'appel à Gemini.",
    })
  }
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Gemini server ready on http://127.0.0.1:${PORT}`)
})
