import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../layout/TopBar.jsx'
import { BacklogFilters } from './BacklogFilters.jsx'
import { BacklogList } from './BacklogList.jsx'
import { MiniCalendarDropTarget } from './MiniCalendarDropTarget.jsx'
import { Button } from '../shared/Button.jsx'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { usePlannerSensors } from '../../utils/dnd/dndContextConfig.js'

export function BacklogPage() {
  const scheduleItemOnDate = useEntityStore((s) => s.scheduleItemOnDate)
  const reorderItem = useEntityStore((s) => s.reorderItem)
  const linkParentChild = useEntityStore((s) => s.linkParentChild)
  const unlinkParentChild = useEntityStore((s) => s.unlinkParentChild)
  const openModal = useAppStore((s) => s.openModal)
  const sensors = usePlannerSensors()
  const navigate = useNavigate()
  const [activeTitle, setActiveTitle] = useState(null)

  const handleDragStart = (event) => {
    setActiveTitle(event.active.data.current?.item?.title ?? null)
  }

  const handleDragEnd = async (event) => {
    setActiveTitle(null)
    const { active, over, delta, activatorEvent } = event
    if (!over) return

    const date = over.data.current?.date
    if (date) {
      // Default to noon so the item lands on the grid at a sensible spot,
      // then jump straight to that day so the user sees where it landed.
      await scheduleItemOnDate(active.id, date, {})
      navigate(`/day/${date}`)
      return
    }

    // Dropped on another backlog row: dropping near the top/bottom of that
    // row reorders the list, dropping in a small central band nests it as a
    // child of that row (the target becomes the parent). The nest band is
    // kept narrow (middle 20%) so reordering — the far more common drag —
    // stays easy to land with a real mouse/touch pointer. Uses the actual
    // pointer position (start position + total movement), not the dragged
    // element's rect — the element can be grabbed anywhere within its row,
    // so its rect has an arbitrary offset from the pointer that isn't useful
    // for this.
    const targetItemId = over.data.current?.itemId
    if (targetItemId && targetItemId !== active.id) {
      const activeItem = active.data.current?.item
      const overRect = over.rect
      const startY = activatorEvent?.touches?.[0]?.clientY ?? activatorEvent?.clientY
      const pointerY = startY != null ? startY + delta.y : null
      const ratio = pointerY != null && overRect && overRect.height > 0
        ? (pointerY - overRect.top) / overRect.height
        : null

      if (ratio != null && ratio > 0.4 && ratio < 0.6) {
        await linkParentChild(targetItemId, active.id)
      } else {
        // Reordering a child pulls it out of its current parent — in this
        // flat-list view a child is just an indented row, so dragging it to
        // a new position is how you un-nest it (in addition to the explicit
        // unlink button in the item modal).
        if (activeItem?.parentIds?.length > 0) {
          await Promise.all(activeItem.parentIds.map((parentId) => unlinkParentChild(parentId, active.id)))
        }
        await reorderItem(active.id, targetItemId, ratio != null && ratio <= 0.4 ? 'before' : 'after')
      }
    }
  }

  return (
    <div className="backlog-page">
      <TopBar />
      <div className="backlog-page-toolbar">
        <h1>Backlog</h1>
        <Button variant="primary" onClick={() => openModal('itemDetail', { itemId: null })}>
          + New Item
        </Button>
      </div>
      <BacklogFilters />
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="backlog-page-content">
          <BacklogList />
          <MiniCalendarDropTarget />
        </div>
        <DragOverlay>{activeTitle && <div className="drag-overlay-chip">{activeTitle}</div>}</DragOverlay>
      </DndContext>
    </div>
  )
}
