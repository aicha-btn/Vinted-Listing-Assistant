import type { ChangeEvent, FormEvent } from 'react'
import {
  categoryOptions,
  conditionOptions,
  objectiveOptions,
  seasonOptions,
  styleOptions,
} from '../data/templates'
import type { ProductFormData } from '../types/listing'
import type { ProductFormErrors } from '../utils/formValidation'

interface ProductFormProps {
  formData: ProductFormData
  errors: ProductFormErrors
  onChange: (field: keyof ProductFormData, value: string) => void
  onSubmit: () => void
  onOpenHistory: () => void
  savedCount: number
}

const createChangeHandler =
  (
    field: keyof ProductFormData,
    onChange: ProductFormProps['onChange'],
  ) =>
  (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) =>
    onChange(field, event.target.value)

export default function ProductForm({
  formData,
  errors,
  onChange,
  onSubmit,
  onOpenHistory,
  savedCount,
}: ProductFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header panel-header-split">
        <div>
          <p className="eyebrow">Étape 1</p>
          <h2>Décris ton article</h2>
          <p className="panel-copy">Commence par l’essentiel. Le reste est optionnel.</p>
        </div>
        <div className="header-chip">Formulaire produit</div>
      </div>

      <section className="form-section">
        <div className="section-heading">
          <h3>Essentiel</h3>
          <p>Ces champs servent à construire le titre et la base de l’annonce.</p>
        </div>

        <div className="form-grid">
          <label className="field field-span-2">
            <span className="field-label">Type d’article *</span>
            <input
              value={formData.typeArticle}
              onChange={createChangeHandler('typeArticle', onChange)}
              placeholder="Ex : robe portefeuille, blazer oversize, boots cuir"
            />
            <span className="field-help">Le type d’article est la base du titre.</span>
            {errors.typeArticle ? (
              <span className="field-error">{errors.typeArticle}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Catégorie *</span>
            <select
              value={formData.categorie}
              onChange={createChangeHandler('categorie', onChange)}
            >
              <option value="">Choisir une catégorie</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.categorie ? (
              <span className="field-error">{errors.categorie}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Marque</span>
            <input
              value={formData.marque}
              onChange={createChangeHandler('marque', onChange)}
              placeholder="Ex : Zara, Nike, Mango"
            />
          </label>

          <label className="field">
            <span className="field-label">Taille *</span>
            <input
              value={formData.taille}
              onChange={createChangeHandler('taille', onChange)}
              placeholder="Ex : S, 38, 40/42"
            />
            {errors.taille ? <span className="field-error">{errors.taille}</span> : null}
          </label>

          <label className="field">
            <span className="field-label">Couleur *</span>
            <input
              value={formData.couleur}
              onChange={createChangeHandler('couleur', onChange)}
              placeholder="Ex : noir, bleu marine, beige"
            />
            {errors.couleur ? (
              <span className="field-error">{errors.couleur}</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">État *</span>
            <select value={formData.etat} onChange={createChangeHandler('etat', onChange)}>
              <option value="">Choisir un état</option>
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.etat ? <span className="field-error">{errors.etat}</span> : null}
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <h3>Détails utiles</h3>
          <p>Ils améliorent le texte, les hashtags et le prix conseillé.</p>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Prix actuel</span>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.prix}
              onChange={createChangeHandler('prix', onChange)}
              placeholder="Ex : 18"
            />
            <span className="field-help">
              Optionnel. Sert à comparer avec le prix conseillé.
            </span>
            {errors.prix ? <span className="field-error">{errors.prix}</span> : null}
          </label>

          <label className="field">
            <span className="field-label">Saison</span>
            <select
              value={formData.saison}
              onChange={createChangeHandler('saison', onChange)}
            >
              <option value="">Choisir une saison</option>
              {seasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Style</span>
            <select value={formData.style} onChange={createChangeHandler('style', onChange)}>
              <option value="">Choisir un style</option>
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Matière</span>
            <input
              value={formData.matiere}
              onChange={createChangeHandler('matiere', onChange)}
              placeholder="Ex : coton, laine, cuir"
            />
          </label>

          <label className="field field-span-2">
            <span className="field-label">Objectif</span>
            <select
              value={formData.objectif}
              onChange={createChangeHandler('objectif', onChange)}
            >
              {objectiveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="field-help">
              {
                objectiveOptions.find((option) => option.value === formData.objectif)
                  ?.helper
              }
            </span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <h3>Transparence</h3>
          <p>Un défaut bien décrit rassure plus qu’un défaut caché.</p>
        </div>

        <div className="form-grid">
          <label className="field field-span-2">
            <span className="field-label">Défaut ou point à signaler</span>
            <textarea
              value={formData.defaut}
              onChange={createChangeHandler('defaut', onChange)}
              rows={4}
              placeholder="Ex : mini trace sur la manche, talon légèrement marqué. Si rien à signaler, tu peux laisser vide."
            />
          </label>
        </div>
      </section>

      <div className="panel-footer">
        <div className="footer-note">
          <strong>Important</strong>
          <span>Les champs avec * sont obligatoires.</span>
        </div>

        <div className="footer-actions">
          {savedCount > 0 ? (
            <button className="secondary-button" type="button" onClick={onOpenHistory}>
              Voir l’historique ({savedCount})
            </button>
          ) : null}
          <button className="primary-button" type="submit">
            Générer mon annonce
          </button>
        </div>
      </div>
    </form>
  )
}
