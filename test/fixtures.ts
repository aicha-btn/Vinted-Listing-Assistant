import type { GeneratedListing, ProductFormData, SavedListing } from '../src/types/listing'

export const productFormFixture: ProductFormData = {
  typeArticle: 'Robe midi',
  marque: 'Marque Démo',
  taille: 'M',
  couleur: 'Bleu marine',
  etat: 'very-good',
  defaut: '',
  prix: '28',
  categorie: 'robes-jupes',
  saison: 'ete',
  style: 'chic',
  objectif: 'best-price',
  matiere: 'Coton',
}

export const listingFixture: GeneratedListing = {
  id: 'listing-demo-1',
  title: 'Marque Démo Robe midi taille M Bleu marine - Très bon état',
  shortDescription: 'Robe midi fictive en très bon état.',
  detailedDescription:
    'Robe midi fictive utilisée uniquement pour les tests. Aucun défaut notable à signaler.',
  hashtags: ['#robemidi', '#marquedemo'],
  priceEstimate: {
    suggestedMin: 13,
    suggestedMax: 36,
    positioning: 'balanced',
    advice: 'Prix fictif cohérent avec la fourchette conseillée.',
  },
  photoTips: ['Photographier la pièce sur un fond neutre.'],
  photoChecklist: ['Photo face'],
  publicationChecklist: ['Relire le titre.'],
  qualityScore: {
    score: 70,
    label: 'bon',
    details: ['Fixture de test.'],
  },
  fullText: 'Annonce fictive complète.',
  createdAt: '2026-01-15T10:00:00.000Z',
  source: 'rules',
}

export const savedListingFixture: SavedListing = {
  id: 'saved-demo-1',
  status: 'draft',
  savedAt: '2026-01-15T10:05:00.000Z',
  formData: productFormFixture,
  listing: listingFixture,
}

export const improveListingRequestFixture = {
  provider: 'gemini' as const,
  prompt: {
    systemPrompt: 'Améliore cette annonce fictive sans inventer de faits.',
    userPrompt: 'Annonce fictive pour une robe midi de démonstration.',
  },
  formData: productFormFixture,
  listing: listingFixture,
}

export const geminiPatchFixture = {
  title: 'Robe midi Marque Démo taille M',
  shortDescription: 'Robe fictive prête à publier.',
  detailedDescription: 'Description détaillée fictive et transparente.',
  hashtags: ['#robemidi', '#modedemo'],
  photoTips: ['Ajouter une photo de face.'],
}
