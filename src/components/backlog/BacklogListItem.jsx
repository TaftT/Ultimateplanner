import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCategoryById } from '../../hooks/useCategories.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { useAuthStore } from '../../store/useAuthStore.js'

export function BacklogListItem({ item }) {
  const category = useCategoryById(item.categoryId)
  const items = useEntityStore((s) => s.items)
  const openModal = useAppStore((s) => s.openModal)
  const signedIn = useAuthStore((s) => Boolean(s.user))

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })
  // Also a drop target so another backlog row can be dropped onto it — to
  // reorder (drop near the top/bottom edge) or to nest as a child (drop on
  // the middle), decided in BacklogPage's onDragEnd.
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `item-${item.id}`,
    data: { itemId: item.id },
  })
  const setRefs = (node) => {
    setDragRef(node)
    setDropRef(node)
  }

  const parent = item.parentIds.length > 0 ? items.find((i) => i.id === item.parentIds[0]) : null
  const childCount = item.childIds.length

  // Deliberately not translating this element with the drag: it spans the
  // full list width, so moving it visually toward the calendar caused a
  // page-wide horizontal scrollbar. The DragOverlay (a small floating chip)
  // provides the drag visual instead; this row just dims in place.
  return (
    <div
      ref={setRefs}
      className={`backlog-list-item ${parent ? 'backlog-item-is-child' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target-active' : ''}`}
      {...listeners}
      {...attributes}
      onClick={() => openModal('itemDetail', { itemId: item.id })}
    >
      {parent && <span className="backlog-child-connector">↳</span>}
      <span className="category-dot" style={{ background: category?.color ?? '#7a8896' }} />
      <span className="backlog-item-title">{item.title}</span>
      {parent && <span className="badge backlog-parent-label" title="Parent task">of {parent.title}</span>}
      {childCount > 0 && (
        <span className="badge" title={`${childCount} subtask${childCount === 1 ? '' : 's'}`}>
          {childCount} sub
        </span>
      )}
      {!item.isUnscheduled && <span className="badge" title="Already on the calendar">Scheduled</span>}
      {item.recurrence && <span className="badge" title="Recurring">⟳</span>}
      {signedIn && item.syncEnabled && <span className="badge" title="Synced to cloud">☁</span>}
      {item.durationMinutes != null ? (
        <span className="backlog-item-duration">{item.durationMinutes}m</span>
      ) : (
        <span className="badge">Reminder</span>
      )}
      <span className="backlog-item-percent">{item.percentComplete}%</span>
    </div>
  )
}
