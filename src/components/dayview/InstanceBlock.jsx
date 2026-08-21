import { useDraggable } from '@dnd-kit/core'
import { useItem } from '../../hooks/useItem.js'
import { useCategoryById } from '../../hooks/useCategories.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { getDisplayStatus } from '../../data/rollover.js'
import { formatTimeLabel, timeStrToMinutes } from '../../utils/dateUtils.js'
import { minutesToPx, MIN_BLOCK_HEIGHT_PX, DAY_HEIGHT } from './gridConstants.js'
import { contrastTextColor } from '../../utils/colorUtils.js'

const STATUS_LABEL = {
  completed: '✓',
  worked_on: '◐',
  ghost: '○',
  in_progress: '◐',
  pending: '',
}

const REMINDER_LABEL_HEIGHT = 18

export function InstanceBlock({ instance, date }) {
  const item = useItem(instance.itemId)
  const category = useCategoryById(item?.categoryId)
  const markInstanceComplete = useEntityStore((s) => s.markInstanceComplete)
  const openModal = useAppStore((s) => s.openModal)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instance.id,
    data: { instance },
  })

  if (!item) return null

  const status = getDisplayStatus(instance)
  // durationMinutes is null when the item is a reminder with no duration —
  // that's a deliberate state, not missing data, so no fallback to a block size.
  const durationMinutes = instance.durationMinutes ?? item.durationMinutes ?? null
  const isReminder = durationMinutes == null
  const color = category?.color ?? '#7a8896'
  const openDetail = () =>
    openModal('itemDetail', { itemId: item.id, instanceId: instance.id, date, time: instance.time })
  const toggleComplete = (e) => {
    e.stopPropagation()
    markInstanceComplete(instance.id)
  }
  const dragTransform = transform ? `translate3d(0, ${transform.y}px, 0)` : undefined

  if (isReminder) {
    const linePx = minutesToPx(timeStrToMinutes(instance.time))
    return (
      <div
        ref={setNodeRef}
        className={`instance-line status-${status}`}
        style={{
          top: linePx - REMINDER_LABEL_HEIGHT,
          height: REMINDER_LABEL_HEIGHT,
          transform: dragTransform,
          zIndex: isDragging ? 20 : 1,
        }}
        {...listeners}
        {...attributes}
        onClick={openDetail}
      >
        <div className="instance-line-label">
          <button
            className="instance-complete-toggle-inline"
            onClick={toggleComplete}
            aria-label="Mark complete"
            title="Mark complete"
          >
            {STATUS_LABEL[status] || '○'}
          </button>
          <span className="instance-line-title">{item.title}</span>
          <span className="instance-line-time">{formatTimeLabel(instance.time)}</span>
        </div>
        <div className="instance-line-bar" style={{ borderColor: color }} />
      </div>
    )
  }

  const top = minutesToPx(timeStrToMinutes(instance.time))
  // An overnight item (e.g. sleep) can run past midnight — clip it at the
  // bottom of this day's grid rather than let it bleed into the blank space
  // below; the remainder renders as a continuation block at the top of
  // tomorrow's grid (see OvernightContinuationBlock).
  const height = Math.max(Math.min(minutesToPx(durationMinutes), DAY_HEIGHT - top), MIN_BLOCK_HEIGHT_PX)
  const textColor = contrastTextColor(color)
  // Sleep isn't a task to do — it reads better as a quiet texture against
  // the grid's own background than as a solid, attention-grabbing block.
  const isSleep = category?.name === 'Sleep'

  const style = {
    top,
    height,
    background: isSleep
      ? `repeating-linear-gradient(45deg, ${color}3d, ${color}3d 6px, transparent 6px, transparent 14px)`
      : status === 'ghost'
        ? 'transparent'
        : color,
    borderColor: color,
    color: isSleep ? 'var(--color-text)' : status === 'ghost' ? 'var(--color-text-muted)' : textColor,
    transform: dragTransform,
    zIndex: isDragging ? 20 : 1,
    opacity: status === 'worked_on' || status === 'in_progress' ? 0.85 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className={`instance-block status-${status}`}
      style={style}
      {...listeners}
      {...attributes}
      onClick={openDetail}
    >
      <button
        className="instance-complete-toggle"
        onClick={toggleComplete}
        aria-label="Mark complete"
        title="Mark complete"
      >
        {STATUS_LABEL[status] || '○'}
      </button>
      <div className="instance-block-title">{item.title}</div>
      {height > 32 && <div className="instance-block-time">{formatTimeLabel(instance.time)}</div>}
    </div>
  )
}
