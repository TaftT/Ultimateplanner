import { useItem } from '../../hooks/useItem.js'
import { useCategoryById } from '../../hooks/useCategories.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { getDisplayStatus } from '../../data/rollover.js'
import { contrastTextColor } from '../../utils/colorUtils.js'

function AllDayChip({ instance, date }) {
  const item = useItem(instance.itemId)
  const category = useCategoryById(item?.categoryId)
  const markInstanceComplete = useEntityStore((s) => s.markInstanceComplete)
  const openModal = useAppStore((s) => s.openModal)
  if (!item) return null

  const status = getDisplayStatus(instance)
  const color = category?.color ?? '#7a8896'

  return (
    <div
      className={`all-day-chip status-${status}`}
      style={{ background: color, color: contrastTextColor(color) }}
      onClick={() => openModal('itemDetail', { itemId: item.id, instanceId: instance.id, date })}
    >
      <button
        className="instance-complete-toggle-inline"
        onClick={(e) => {
          e.stopPropagation()
          markInstanceComplete(instance.id)
        }}
        aria-label="Mark complete"
      >
        {status === 'completed' ? '✓' : '○'}
      </button>
      {item.title}
    </div>
  )
}

export function AllDayRow({ instances, date }) {
  const allDay = instances.filter((i) => i.isAllDay)
  if (allDay.length === 0) return null

  return (
    <div className="all-day-row">
      {allDay.map((instance) => (
        <AllDayChip key={instance.id} instance={instance} date={date} />
      ))}
    </div>
  )
}
