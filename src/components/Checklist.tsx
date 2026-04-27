import CopyIconButton from './CopyIconButton'

interface ChecklistProps {
  title: string
  items: string[]
  onCopy?: (value: string) => void
}

export default function Checklist({ title, items, onCopy }: ChecklistProps) {
  return (
    <section className="subcard">
      <div className="subcard-header subcard-header-row">
        <h3>{title}</h3>
        {onCopy ? (
          <CopyIconButton
            label={`Copier ${title.toLowerCase()}`}
            onClick={() => onCopy(items.join('\n'))}
          />
        ) : null}
      </div>
      <ul className="checklist-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
