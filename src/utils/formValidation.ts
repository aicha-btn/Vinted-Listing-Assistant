import type { ProductFormData } from '../types/listing'

export type ProductFormErrors = Partial<Record<keyof ProductFormData, string>>

const requiredFieldLabels: Partial<Record<keyof ProductFormData, string>> = {
  typeArticle: 'Le type d’article est requis.',
  categorie: 'La catégorie est requise.',
  taille: 'La taille est requise.',
  couleur: 'La couleur est requise.',
  etat: 'L’état est requis.',
}

export const validateProductForm = (formData: ProductFormData) => {
  const errors: ProductFormErrors = {}

  for (const field of Object.keys(requiredFieldLabels) as Array<
    keyof typeof requiredFieldLabels
  >) {
    if (!formData[field]?.trim()) {
      errors[field] = requiredFieldLabels[field]
    }
  }

  if (formData.prix && Number(formData.prix) < 0) {
    errors.prix = 'Le prix ne peut pas être négatif.'
  }

  return errors
}
