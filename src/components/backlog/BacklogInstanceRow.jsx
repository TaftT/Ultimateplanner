import { useCategoryById } from '../../hooks/useCategories.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { getDisplayStatus } from '../../data/rollover.js'
import { formatShortDate, formatTimeLabel, isTodayStr } from '../../utils/dateUtils.js'

const STATUS_LABEL = {
  completed: '✓',
  worked_on: '◐',
  ghost: '○',
  in_progress: '◐',
  pending: '○',
}

/** One occurrence of a recurring item's upcoming series, completable on its own. */
export function BacklogInstanceRow({ item, instance }) {
  const category = useCategoryById(item.categoryId)
  const markInstanceComplete = useEntityStore((s) => s.markInstanceComplete)
  const openModal = useAppStore((s) => s.openModal)

  const status = getDisplayStatus(instance)
  const dateLabel = isTodayStr(instance.date) ? 'Today' : formatShortDate(instance.date)

  return (
    <div
      className="backlog-list-item backlog-instance-row"
      onClick={() =>
        openModal('itemDetail', { itemId: item.id, instanceId: instance.id, date: instance.date, time: instance.time })
      }
    >
      <button
        className="instance-complete-toggle-inline"
        onClick={(e) => {
          e.stopPropagation()
          markInstanceComplete(instance.id)
        }}
        aria-label="Mark complete"
        title="Mark complete"
      >
        {STATUS_LABEL[status]}
      </button>
      <span className="category-dot" style={{ background: category?.color ?? '#7a8896' }} />
      <span className="backlog-item-title">{item.title}</span>
      <span className="badge" title="Recurring">⟳</span>
      <span className="backlog-instance-date">
        {dateLabel}
        {!instance.isAllDay && instance.time ? ` · ${formatTimeLabel(instance.time)}` : ''}
      </span>
      <span className="backlog-item-percent">{instance.percentComplete}%</span>
    </div>
  )
}
