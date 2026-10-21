import type { GoogleGenAI } from '@google/genai'
import { describe, expect, it, vi } from 'vitest'
import { geminiPatchFixture, improveListingRequestFixture } from '../test/fixtures'
import {
  generateGeminiListingPatch,
  GeminiProviderError,
  GeminiTimeoutError,
  InvalidGeminiResponseError,
} from './gemini'

const createClient = (generateContent: (request: unknown) => Promise<unknown>) =>
  ({
    models: { generateContent },
  }) as unknown as GoogleGenAI

describe('Gemini adapter', () => {
  it('parses and validates a valid provider response', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify(geminiPatchFixture),
    })
    const result = await generateGeminiListingPatch(
      createClient(generateContent),
      'gemini-test-model',
      improveListingRequestFixture.prompt,
    )

    expect(result).toEqual(geminiPatchFixture)
    expect(generateContent).toHaveBeenCalledOnce()
    expect(generateContent.mock.calls[0][0]).toMatchObject({
      model: 'gemini-test-model',
      config: { maxOutputTokens: 1600, responseMimeType: 'application/json' },
    })
  })

  it('accepts JSON returned in a fenced code block', async () => {
    const client = createClient(async () => ({
      text: `\`\`\`json\n${JSON.stringify(geminiPatchFixture)}\n\`\`\``,
    }))
    await expect(
      generateGeminiListingPatch(
        client,
        'gemini-test-model',
        improveListingRequestFixture.prompt,
      ),
    ).resolves.toEqual(geminiPatchFixture)
  })

  it('rejects malformed JSON as an invalid response', async () => {
    const client = createClient(async () => ({ text: '{broken' }))
    await expect(
      generateGeminiListingPatch(
        client,
        'gemini-test-model',
        improveListingRequestFixture.prompt,
      ),
    ).rejects.toBeInstanceOf(InvalidGeminiResponseError)
  })

  it('rejects valid JSON with an invalid schema', async () => {
    const client = createClient(async () => ({ text: '{"title":"only"}' }))
    await expect(
      generateGeminiListingPatch(
        client,
        'gemini-test-model',
        improveListingRequestFixture.prompt,
      ),
    ).rejects.toBeInstanceOf(InvalidGeminiResponseError)
  })

  it('maps an SDK rejection to a provider error', async () => {
    const client = createClient(async () => {
      throw new Error('provider detail that must stay internal')
    })
    await expect(
      generateGeminiListingPatch(
        client,
        'gemini-test-model',
        improveListingRequestFixture.prompt,
      ),
    ).rejects.toBeInstanceOf(GeminiProviderError)
  })

  it('recognizes an aborted provider request as a timeout', async () => {
    const client = createClient(
      (request) =>
        new Promise((_resolve, reject) => {
          const signal = (request as { config: { abortSignal: AbortSignal } }).config
            .abortSignal
          signal.addEventListener('abort', () => reject(new Error('aborted')))
        }),
    )
    await expect(
      generateGeminiListingPatch(
        client,
        'gemini-test-model',
        improveListingRequestFixture.prompt,
        5,
      ),
    ).rejects.toBeInstanceOf(GeminiTimeoutError)
  })
})
