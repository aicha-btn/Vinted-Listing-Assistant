import { useState } from 'react'
import Checklist from './Checklist'
import CopyIconButton from './CopyIconButton'
import QualityScore from './QualityScore'
import { pricePositioningLabels } from '../data/templates'
import type { AiImprovementResult, AiResultStatus } from '../types/ai'
import type { GeneratedListing as GeneratedListingData } from '../types/listing'

interface GeneratedListingProps {
  listing: GeneratedListingData | null
  activeListing: GeneratedListingData | null
  aiImprovement: AiImprovementResult | null
  aiStatus: AiResultStatus
  aiError: string | null
  activeVariant: 'rules' | 'ai'
  onCopy: (value: string) => void
  onSave: () => void
  onImproveWithAi: () => void
  onSelectVariant: (variant: 'rules' | 'ai') => void
  onBackToForm: () => void
  onOpenHistory: () => void
}

type ResultTab = 'annonce' | 'photos' | 'publication'

export default function GeneratedListingPanel({
  listing,
  activeListing,
  aiImprovement,
  aiStatus,
  aiError,
  activeVariant,
  onCopy,
  onSave,
  onImproveWithAi,
  onSelectVariant,
  onBackToForm,
  onOpenHistory,
}: GeneratedListingProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>('annonce')

  if (!listing) {
    return (
      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Étape 2</p>
          <h2>Annonce</h2>
          <p className="panel-copy">Génère d’abord une annonce depuis l’étape produit.</p>
        </div>

        <div className="empty-state">
          <p className="empty-title">Aucun résultat pour l’instant.</p>
          <p>Retourne à l’étape 1 pour générer une annonce complète.</p>
          <button className="primary-button" type="button" onClick={onBackToForm}>
            Revenir au formulaire
          </button>
        </div>
      </section>
    )
  }

  const displayedListing = activeListing ?? listing

  return (
    <section className="panel">
      <div className="panel-header panel-header-split">
        <div>
          <p className="eyebrow">Étape 2</p>
          <h2>Annonce générée</h2>
          <p className="panel-copy">
            Version maison d’abord, amélioration IA en option.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="primary-button"
            type="button"
            onClick={onImproveWithAi}
            disabled={aiStatus === 'loading'}
          >
            {aiStatus === 'loading'
              ? 'IA en cours...'
              : aiImprovement
                ? '✨ Relancer l’amélioration IA'
                : '✨ Améliorer avec IA'}
          </button>
          <button className="secondary-button" type="button" onClick={onBackToForm}>
            Modifier le produit
          </button>
          <button className="secondary-button" type="button" onClick={onOpenHistory}>
            Historique
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span className="summary-label">Score</span>
          <strong>{displayedListing.qualityScore.score}/100</strong>
          <span>{displayedListing.qualityScore.label}</span>
        </article>

        <article className="summary-card">
          <span className="summary-label">Prix conseillé</span>
          <strong>
            {displayedListing.priceEstimate.suggestedMin} € -{' '}
            {displayedListing.priceEstimate.suggestedMax} €
          </strong>
          <span>{pricePositioningLabels[displayedListing.priceEstimate.positioning]}</span>
        </article>

        <article className="summary-card">
          <span className="summary-label">Hashtags</span>
          <strong>{displayedListing.hashtags.length}</strong>
          <span>prêts</span>
        </article>
      </div>

      {aiStatus === 'success' && aiImprovement ? (
        <section className="compare-panel">
          <div className="compare-panel-head">
            <div>
              <h3>Comparaison avant / après</h3>
              <p className="panel-copy">
                Version IA actuelle : {aiImprovement.providerLabel}
              </p>
            </div>
            <div className="compare-switch">
              <button
                className={`tab-button${activeVariant === 'rules' ? ' tab-button-active' : ''}`}
                type="button"
                onClick={() => onSelectVariant('rules')}
              >
                Version maison
              </button>
              <button
                className={`tab-button${activeVariant === 'ai' ? ' tab-button-active' : ''}`}
                type="button"
                onClick={() => onSelectVariant('ai')}
              >
                Version IA
              </button>
            </div>
          </div>

          <div className="compare-grid">
            <article className="compare-card">
              <span className="summary-label">Maison</span>
              <strong>{listing.title}</strong>
              <p>{listing.shortDescription}</p>
            </article>
            <article className="compare-card compare-card-highlight">
              <span className="summary-label">{aiImprovement.providerLabel}</span>
              <strong>{aiImprovement.listing.title}</strong>
              <p>{aiImprovement.listing.shortDescription}</p>
            </article>
          </div>
        </section>
      ) : null}

      {aiStatus === 'error' && aiError ? (
        <p className="error-banner">{aiError}</p>
      ) : null}

      {aiStatus === 'success' && aiImprovement ? (
        <p className="info-banner">
          Tu peux comparer, copier la version IA, revenir à la version maison ou
          sauvegarder la version affichée.
        </p>
      ) : null}

      <div className="action-row action-row-compact">
        <button className="primary-button" type="button" onClick={onSave}>
          Sauvegarder
        </button>
      </div>

      <div className="tab-row" role="tablist" aria-label="Sections du résultat">
        {[
          { key: 'annonce', label: 'Annonce' },
          { key: 'photos', label: 'Photos' },
          { key: 'publication', label: 'Publication' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-button${activeTab === tab.key ? ' tab-button-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key as ResultTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'annonce' ? (
        <div className="result-stack">
          <section className="subcard">
            <div className="subcard-header subcard-header-row">
              <h3>Titre</h3>
              <CopyIconButton
                label="Copier le titre"
                onClick={() => onCopy(displayedListing.title)}
              />
            </div>
            <p className="formatted-text strong-text">{displayedListing.title}</p>
          </section>

          <section className="subcard">
            <div className="subcard-header subcard-header-row">
              <h3>Description courte</h3>
              <CopyIconButton
                label="Copier la description courte"
                onClick={() => onCopy(displayedListing.shortDescription)}
              />
            </div>
            <p className="formatted-text">{displayedListing.shortDescription}</p>
          </section>

          <section className="subcard">
            <div className="subcard-header subcard-header-row">
              <h3>Description détaillée</h3>
              <CopyIconButton
                label="Copier la description détaillée"
                onClick={() => onCopy(displayedListing.detailedDescription)}
              />
            </div>
            <p className="formatted-text">{displayedListing.detailedDescription}</p>
          </section>

          <section className="subcard">
            <div className="subcard-header subcard-header-row">
              <h3>Hashtags</h3>
              <CopyIconButton
                label="Copier les hashtags"
                onClick={() => onCopy(displayedListing.hashtags.join(' '))}
              />
            </div>
            <p className="tag-cloud">{displayedListing.hashtags.join(' ')}</p>
          </section>

          <section className="subcard">
            <div className="subcard-header subcard-header-row">
              <h3>Annonce complète</h3>
              <CopyIconButton
                label="Copier l’annonce complète"
                onClick={() => onCopy(displayedListing.fullText)}
              />
            </div>
            <p className="formatted-text">
              Titre, descriptions, hashtags et prix conseillés prêts à être collés.
            </p>
          </section>
        </div>
      ) : null}

      {activeTab === 'photos' ? (
        <div className="result-stack">
          <Checklist
            title="Conseils photo"
            items={displayedListing.photoTips}
            onCopy={onCopy}
          />
          <Checklist
            title="Checklist photo"
            items={displayedListing.photoChecklist}
            onCopy={onCopy}
          />
        </div>
      ) : null}

      {activeTab === 'publication' ? (
        <div className="result-stack">
          <section className="subcard price-card">
            <div className="subcard-header subcard-header-row">
              <div>
                <h3>Prix conseillé</h3>
                <p className="price-range">
                  {displayedListing.priceEstimate.suggestedMin} € -{' '}
                  {displayedListing.priceEstimate.suggestedMax} €
                </p>
              </div>
              <div className="price-actions">
                <span className="price-chip">
                  {pricePositioningLabels[displayedListing.priceEstimate.positioning]}
                </span>
                <CopyIconButton
                  label="Copier le prix conseillé"
                  onClick={() =>
                    onCopy(
                      `Prix conseillé : ${displayedListing.priceEstimate.suggestedMin} € - ${displayedListing.priceEstimate.suggestedMax} €\n${displayedListing.priceEstimate.advice}`,
                    )
                  }
                />
              </div>
            </div>
            <p className="formatted-text">{displayedListing.priceEstimate.advice}</p>
          </section>

          <QualityScore
            result={displayedListing.qualityScore}
            onCopy={onCopy}
          />

          <Checklist
            title="Checklist avant publication"
            items={displayedListing.publicationChecklist}
            onCopy={onCopy}
          />
        </div>
      ) : null}
    </section>
  )
}
