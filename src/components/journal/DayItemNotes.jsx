import { useInstancesForDate } from '../../hooks/useInstancesForDate.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { isRichTextEmpty } from '../../utils/richText.js'

/** Read-only rollup of each scheduled item's own notes for the day, shown
 * under the journal so a day's context (task notes) sits alongside the
 * free-form entry — editing still happens in the item's own modal. Notes
 * live on the instance (independent per occurrence), so this reads
 * instance.notes rather than the item template's notes. */
export function DayItemNotes({ date }) {
  const instances = useInstancesForDate(date)
  const items = useEntityStore((s) => s.items)

  const entries = instances
    .map((instance) => ({ instance, item: items.find((i) => i.id === instance.itemId) }))
    .filter(({ item, instance }) => item && !isRichTextEmpty(instance.notes))

  if (entries.length === 0) return null

  return (
    <div className="day-item-notes">
      {entries.map(({ instance, item }) => (
        <div key={instance.id} className="day-item-note">
          <div className="day-item-note-title">{item.title}</div>
          <div className="day-item-note-body" dangerouslySetInnerHTML={{ __html: instance.notes }} />
        </div>
      ))}
    </div>
  )
}
