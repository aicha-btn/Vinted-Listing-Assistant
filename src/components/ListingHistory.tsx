import { statusOptions } from '../data/templates'
import type { ListingStatus, SavedListing } from '../types/listing'

interface ListingHistoryProps {
  entries: SavedListing[]
  onLoad: (entry: SavedListing) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ListingStatus) => void
  onCreateNew: () => void
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export default function ListingHistory({
  entries,
  onLoad,
  onDelete,
  onStatusChange,
  onCreateNew,
}: ListingHistoryProps) {
  return (
    <section className="panel">
      <div className="panel-header panel-header-split">
        <div>
          <p className="eyebrow">Étape 3</p>
          <h2>Historique</h2>
          <p className="panel-copy">Retrouve ici tes annonces sauvegardées localement.</p>
        </div>
        <button className="primary-button" type="button" onClick={onCreateNew}>
          Nouvelle annonce
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-history">
          <p className="empty-title">Aucune annonce sauvegardée.</p>
          <p>Crée une annonce puis sauvegarde-la pour la retrouver ici.</p>
        </div>
      ) : (
        <div className="history-grid">
          {entries.map((entry) => (
            <article className="history-card" key={entry.id}>
              <div className="history-card-head">
                <div>
                  <h3>{entry.listing.title}</h3>
                  <p className="history-meta">Sauvegardée le {formatDate(entry.savedAt)}</p>
                </div>

                <select
                  value={entry.status}
                  onChange={(event) =>
                    onStatusChange(entry.id, event.target.value as ListingStatus)
                  }
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <p className="history-summary">
                {entry.formData.typeArticle} · {entry.formData.taille} ·{' '}
                {entry.formData.couleur}
              </p>
              <p className="history-summary">
                Prix conseillé : {entry.listing.priceEstimate.suggestedMin} € -{' '}
                {entry.listing.priceEstimate.suggestedMax} €
              </p>
              {entry.listing.providerLabel ? (
                <p className="history-summary">Source : {entry.listing.providerLabel}</p>
              ) : null}

              <div className="history-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onLoad(entry)}
                >
                  Recharger
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => onDelete(entry.id)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
