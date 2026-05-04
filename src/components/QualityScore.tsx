import CopyIconButton from './CopyIconButton'
import type { QualityScoreResult } from '../types/listing'

interface QualityScoreProps {
  result: QualityScoreResult
  onCopy?: (value: string) => void
}

export default function QualityScore({ result, onCopy }: QualityScoreProps) {
  return (
    <section className="subcard quality-card">
      <div className="quality-score-layout">
        <div className={`score-badge score-${result.label}`}>{result.score}/100</div>
        <div>
          <div className="subcard-header subcard-header-row">
            <h3>Score qualité</h3>
            {onCopy ? (
              <CopyIconButton
                label="Copier le score qualité"
                onClick={() =>
                  onCopy(
                    [
                      `Score qualité : ${result.score}/100`,
                      `Niveau : ${result.label}`,
                      ...result.details,
                    ].join('\n'),
                  )
                }
              />
            ) : null}
          </div>
          <p className="panel-copy">
            Niveau actuel : <strong>{result.label}</strong>
          </p>
          <ul className="detail-list">
            {result.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
