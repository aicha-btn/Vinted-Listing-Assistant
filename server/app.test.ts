import type { GoogleGenAI } from '@google/genai'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import {
  geminiPatchFixture,
  improveListingRequestFixture,
} from '../test/fixtures'
import { createApp, RATE_LIMIT_MAX_REQUESTS } from './app'
import {
  GeminiProviderError,
  GeminiTimeoutError,
} from './gemini'

const fakeAi = {} as GoogleGenAI

describe('Express API', () => {
  it('returns a minimal health response', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' })).get(
      '/api/health',
    )
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('returns 400 for malformed JSON', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' }))
      .post('/api/improve-listing')
      .set('Content-Type', 'application/json')
      .send('{broken')
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Requête invalide.' })
  })

  it('returns 400 for an invalid payload', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' }))
      .post('/api/improve-listing')
      .send({ prompt: {} })
    expect(response.status).toBe(400)
  })

  it('returns 400 for a field exceeding its business limit', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' }))
      .post('/api/improve-listing')
      .send({
        ...improveListingRequestFixture,
        formData: {
          ...improveListingRequestFixture.formData,
          typeArticle: 'x'.repeat(121),
        },
      })
    expect(response.status).toBe(400)
  })

  it('returns 413 when the JSON body exceeds 32kb', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' }))
      .post('/api/improve-listing')
      .send({ padding: 'x'.repeat(33 * 1024) })
    expect(response.status).toBe(413)
    expect(response.body).toEqual({ error: 'Requête trop volumineuse.' })
  })

  it('returns 503 when Gemini is not configured', async () => {
    const response = await request(createApp({ ai: null, model: 'unused' }))
      .post('/api/improve-listing')
      .send(improveListingRequestFixture)
    expect(response.status).toBe(503)
    expect(response.body).toEqual({ error: 'Service IA indisponible.' })
  })

  it('returns the validated provider patch on success', async () => {
    const generateListingPatch = vi.fn().mockResolvedValue(geminiPatchFixture)
    const response = await request(
      createApp({ ai: fakeAi, model: 'gemini-test', generateListingPatch }),
    )
      .post('/api/improve-listing')
      .send(improveListingRequestFixture)
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      provider: 'gemini',
      providerLabel: 'Gemini (gemini-test)',
      mode: 'provider',
      listingPatch: geminiPatchFixture,
    })
    expect(generateListingPatch).toHaveBeenCalledOnce()
  })

  it('maps provider failures to a generic 502 response', async () => {
    const generateListingPatch = vi.fn().mockRejectedValue(new GeminiProviderError())
    const response = await request(
      createApp({ ai: fakeAi, model: 'gemini-test', generateListingPatch }),
    )
      .post('/api/improve-listing')
      .send(improveListingRequestFixture)
    expect(response.status).toBe(502)
    expect(response.body).toEqual({
      error: 'Le service IA a renvoyé une réponse invalide.',
    })
  })

  it('maps timeouts to 504', async () => {
    const generateListingPatch = vi.fn().mockRejectedValue(new GeminiTimeoutError())
    const response = await request(
      createApp({ ai: fakeAi, model: 'gemini-test', generateListingPatch }),
    )
      .post('/api/improve-listing')
      .send(improveListingRequestFixture)
    expect(response.status).toBe(504)
  })

  it('returns 429 after the in-process request allowance is exceeded', async () => {
    const app = createApp({ ai: null, model: 'unused' })

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      const allowedResponse = await request(app)
        .post('/api/improve-listing')
        .send(improveListingRequestFixture)
      expect(allowedResponse.status).toBe(503)
    }

    const blockedResponse = await request(app)
      .post('/api/improve-listing')
      .send(improveListingRequestFixture)
    expect(blockedResponse.status).toBe(429)
    expect(blockedResponse.body).toEqual({
      error: 'Trop de requêtes. Réessaie plus tard.',
    })
  })
})
