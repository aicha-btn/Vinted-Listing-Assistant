import { afterEach, describe, expect, it, vi } from 'vitest'
import { productFormFixture } from '../../test/fixtures'
import { calculateScore } from './calculateScore'
import { estimatePrice } from './estimatePrice'
import { generateHashtags } from './generateHashtags'
import { generateListing } from './generateListing'
import { validateProductForm } from './formValidation'

describe('local listing generation', () => {
  afterEach(() => vi.useRealTimers())

  it('generates a deterministic structured listing', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T10:00:00.000Z'))

    const listing = generateListing(productFormFixture)

    expect(listing.id).toBe('listing-1768471200000')
    expect(listing.createdAt).toBe('2026-01-15T10:00:00.000Z')
    expect(listing.title).toContain('Robe midi')
    expect(listing.shortDescription).toContain('Bleu marine')
    expect(listing.detailedDescription).toContain('Aucun défaut notable')
    expect(listing.hashtags.length).toBeGreaterThan(0)
    expect(listing.fullText).toContain(listing.title)
  })

  it('includes a declared defect in the listing and photo guidance', () => {
    const listing = generateListing({
      ...productFormFixture,
      defaut: 'Petite couture reprise',
    })

    expect(listing.detailedDescription).toContain('Petite couture reprise')
    expect(listing.photoTips.at(-1)).toContain('photo nette du défaut')
    expect(listing.photoChecklist).toContain('Photo du défaut')
  })
})

describe('price estimation', () => {
  it('calculates the expected nominal range from category, condition, brand and objective', () => {
    expect(estimatePrice(productFormFixture)).toMatchObject({
      suggestedMin: 13,
      suggestedMax: 36,
      positioning: 'balanced',
    })
  })

  it('never suggests less than the three euro floor', () => {
    const result = estimatePrice({
      ...productFormFixture,
      categorie: 'accessoires',
      marque: '',
      etat: 'correct',
      objectif: 'fast-sale',
    })

    expect(result.suggestedMin).toBeGreaterThanOrEqual(3)
    expect(result.suggestedMax).toBeGreaterThanOrEqual(result.suggestedMin)
  })

  it('flags a current price below the suggested range', () => {
    const result = estimatePrice({ ...productFormFixture, prix: '1' })
    expect(result.advice).toContain('plutôt bas')
  })

  it('flags a current price above the suggested range', () => {
    const result = estimatePrice({ ...productFormFixture, prix: '999' })
    expect(result.advice).toContain('au-dessus')
  })

  it('uses objective guidance when no valid current price is provided', () => {
    const result = estimatePrice({
      ...productFormFixture,
      prix: 'non numérique',
      objectif: 'premium',
    })
    expect(result.positioning).toBe('ambitious')
    expect(result.advice).toContain('ambitieux')
  })
})

describe('hashtags', () => {
  it('normalizes accents, spaces and punctuation', () => {
    const hashtags = generateHashtags({
      ...productFormFixture,
      typeArticle: 'Écharpe d’été !',
      marque: '',
    })
    expect(hashtags).toContain('#echarpedete')
  })

  it('deduplicates normalized values', () => {
    const hashtags = generateHashtags({
      ...productFormFixture,
      typeArticle: 'Robe',
      marque: 'robe',
      couleur: 'Rôbe',
    })
    expect(hashtags.filter((tag) => tag === '#robe')).toHaveLength(1)
  })

  it('limits output to ten hashtags', () => {
    expect(generateHashtags(productFormFixture)).toHaveLength(10)
  })
})

describe('quality score', () => {
  it('returns a weak score for an incomplete listing', () => {
    const result = calculateScore(
      { ...productFormFixture, etat: '', taille: '', prix: '', defaut: '' },
      { title: 'Robe', detailedDescription: 'Courte.', hashtags: [] },
    )
    expect(result).toMatchObject({ score: 0, label: 'faible' })
  })

  it('returns an intermediate score for partially complete content', () => {
    const result = calculateScore(productFormFixture, {
      title: 'Robe midi bleue taille M',
      detailedDescription: 'Aucun défaut notable à signaler.',
      hashtags: [],
    })
    expect(result).toMatchObject({ score: 80, label: 'bon' })
  })

  it('caps a complete listing at the 100 point contract', () => {
    const result = calculateScore(productFormFixture, {
      title: 'Robe midi bleue taille M élégante',
      detailedDescription: `Aucun défaut notable à signaler. ${'Détail '.repeat(50)}`,
      hashtags: ['#robe'],
    })
    expect(result).toMatchObject({ score: 100, label: 'excellent' })
  })
})

describe('form validation', () => {
  it('accepts a valid form', () => {
    expect(validateProductForm(productFormFixture)).toEqual({})
  })

  it('rejects every required field when it only contains whitespace', () => {
    const errors = validateProductForm({
      ...productFormFixture,
      typeArticle: ' ',
      categorie: '',
      taille: ' ',
      couleur: '',
      etat: '',
    })
    expect(Object.keys(errors)).toEqual([
      'typeArticle',
      'categorie',
      'taille',
      'couleur',
      'etat',
    ])
  })

  it('rejects a negative price', () => {
    expect(validateProductForm({ ...productFormFixture, prix: '-1' })).toHaveProperty(
      'prix',
    )
  })

  it('keeps an empty optional price valid', () => {
    expect(validateProductForm({ ...productFormFixture, prix: '' })).not.toHaveProperty(
      'prix',
    )
  })
})
