import type { GoogleGenAI } from '@google/genai'
import {
  geminiListingPatchSchema,
  type GeminiListingPatch,
  type ImproveListingRequest,
} from './validation'

export const GEMINI_MAX_OUTPUT_TOKENS = 1_600
export const GEMINI_TIMEOUT_MS = 15_000

export class GeminiTimeoutError extends Error {
  override name = 'GeminiTimeoutError'
}

export class GeminiProviderError extends Error {
  override name = 'GeminiProviderError'
}

export class InvalidGeminiResponseError extends Error {
  override name = 'InvalidGeminiResponseError'
}

const extractJson = (value: string): unknown => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    throw new InvalidGeminiResponseError()
  }

  const fencedMatch = trimmedValue.match(/```json\s*([\s\S]*?)```/i)
  const rawJson = fencedMatch ? fencedMatch[1].trim() : trimmedValue

  try {
    return JSON.parse(rawJson)
  } catch {
    throw new InvalidGeminiResponseError()
  }
}

export async function generateGeminiListingPatch(
  ai: GoogleGenAI,
  model: string,
  prompt: ImproveListingRequest['prompt'],
  timeoutMs = GEMINI_TIMEOUT_MS,
): Promise<GeminiListingPatch> {
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), timeoutMs)

  try {
    const geminiResponse = await ai.models.generateContent({
      model,
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
        maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
        abortSignal: abortController.signal,
      },
    })

    const parsed = geminiListingPatchSchema.safeParse(
      extractJson(geminiResponse.text ?? ''),
    )

    if (!parsed.success) {
      throw new InvalidGeminiResponseError()
    }

    return parsed.data
  } catch (error) {
    if (abortController.signal.aborted) {
      throw new GeminiTimeoutError()
    }

    if (error instanceof InvalidGeminiResponseError) {
      throw error
    }

    throw new GeminiProviderError()
  } finally {
    clearTimeout(timeout)
  }
}
