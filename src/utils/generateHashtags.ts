import { defaultHashtags, hashtagRuleMap } from '../data/hashtagRules'
import type { ProductFormData } from '../types/listing'

const MAX_HASHTAGS = 10

const normalizeValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()

const addTag = (tagSet: Set<string>, value: string) => {
  const cleanValue = normalizeValue(value)

  if (cleanValue) {
    tagSet.add(`#${cleanValue}`)
  }
}

const addRuleTags = (
  tagSet: Set<string>,
  source: keyof typeof hashtagRuleMap,
  key: string,
) => {
  const values = (hashtagRuleMap[source] as Record<string, readonly string[]>)[key]

  if (!values) {
    return
  }

  values.forEach((value) => addTag(tagSet, value))
}

export function generateHashtags(formData: ProductFormData) {
  const tagSet = new Set<string>()

  ;[
    formData.typeArticle,
    formData.marque,
    formData.couleur,
    formData.taille,
    formData.categorie,
    formData.saison,
    formData.style,
  ]
    .filter(Boolean)
    .forEach((value) => addTag(tagSet, value))

  addRuleTags(tagSet, 'category', formData.categorie)
  addRuleTags(tagSet, 'season', formData.saison)
  addRuleTags(tagSet, 'style', formData.style)
  defaultHashtags.forEach((value) => addTag(tagSet, value))

  return Array.from(tagSet).slice(0, MAX_HASHTAGS)
}
