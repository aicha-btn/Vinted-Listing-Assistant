import { describe, expect, it } from 'vitest'
import {
  geminiPatchFixture,
  improveListingRequestFixture,
} from '../test/fixtures'
import {
  geminiListingPatchSchema,
  improveListingRequestSchema,
} from './validation'

describe('improve listing request validation', () => {
  it('accepts and trims a valid request', () => {
    const result = improveListingRequestSchema.parse({
      ...improveListingRequestFixture,
      formData: {
        ...improveListingRequestFixture.formData,
        typeArticle: '  Robe midi  ',
      },
    })
    expect(result.formData.typeArticle).toBe('Robe midi')
  })

  it('rejects a missing required field', () => {
    const formData: Partial<typeof improveListingRequestFixture.formData> = {
      ...improveListingRequestFixture.formData,
    }
    delete formData.typeArticle
    expect(
      improveListingRequestSchema.safeParse({
        ...improveListingRequestFixture,
        formData,
      }).success,
    ).toBe(false)
  })

  it('rejects an overlong field', () => {
    expect(
      improveListingRequestSchema.safeParse({
        ...improveListingRequestFixture,
        formData: {
          ...improveListingRequestFixture.formData,
          typeArticle: 'x'.repeat(121),
        },
      }).success,
    ).toBe(false)
  })

  it('rejects an incorrect field type', () => {
    expect(
      improveListingRequestSchema.safeParse({
        ...improveListingRequestFixture,
        formData: { ...improveListingRequestFixture.formData, prix: 28 },
      }).success,
    ).toBe(false)
  })

  it('rejects an unsupported enum value', () => {
    expect(
      improveListingRequestSchema.safeParse({
        ...improveListingRequestFixture,
        formData: {
          ...improveListingRequestFixture.formData,
          objectif: 'viral',
        },
      }).success,
    ).toBe(false)
  })

  it('rejects unknown fields', () => {
    expect(
      improveListingRequestSchema.safeParse({
        ...improveListingRequestFixture,
        unexpected: true,
      }).success,
    ).toBe(false)
  })

  it('accepts a complete valid listing', () => {
    expect(improveListingRequestSchema.safeParse(improveListingRequestFixture).success).toBe(
      true,
    )
  })
})

describe('Gemini response validation', () => {
  it('accepts the expected patch shape', () => {
    expect(geminiListingPatchSchema.parse(geminiPatchFixture)).toEqual(
      geminiPatchFixture,
    )
  })

  it('rejects a structurally invalid patch', () => {
    expect(
      geminiListingPatchSchema.safeParse({
        ...geminiPatchFixture,
        hashtags: 'not-an-array',
      }).success,
    ).toBe(false)
  })

  it('rejects unknown response fields', () => {
    expect(
      geminiListingPatchSchema.safeParse({
        ...geminiPatchFixture,
        internalMetadata: 'not allowed',
      }).success,
    ).toBe(false)
  })
})
