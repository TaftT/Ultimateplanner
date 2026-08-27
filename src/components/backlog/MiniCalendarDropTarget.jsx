import { useEffect, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useNavigate } from 'react-router-dom'
import { format, isSameMonth } from 'date-fns'
import { toDateStr, isTodayStr } from '../../utils/dateUtils.js'
import { useMonthGridDays } from '../../hooks/useMonthGridDays.js'

function DayCell({ day, monthAnchor }) {
  const dateStr = toDateStr(day)
  const navigate = useNavigate()
  const { setNodeRef, isOver } = useDroppable({ id: dateStr, data: { date: dateStr } })
  const inMonth = isSameMonth(day, monthAnchor)

  return (
    <button
      ref={setNodeRef}
      className={[
        'mini-calendar-day',
        !inMonth && 'outside-month',
        isTodayStr(dateStr) && 'is-today',
        isOver && 'drop-target-active',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => navigate(`/day/${dateStr}`)}
    >
      {format(day, 'd')}
    </button>
  )
}

/**
 * Collapses to a compact strip by default (the full month grid ate a lot of
 * space in the backlog for something only needed while dragging). Unlike an
 * earlier version, it does NOT expand just because some drag is happening
 * anywhere in the backlog — that popped it open for ordinary reordering too,
 * which wasn't wanted. It only opens when a drag is actually hovered over
 * this collapsed button (registered as its own droppable target below) or
 * when clicked directly, and collapses again once the drag/click-open ends.
 */
export function MiniCalendarDropTarget({ isDragging = false }) {
  const { monthAnchor, days, goToPrevMonth, goToNextMonth } = useMonthGridDays()
  const [manuallyExpanded, setManuallyExpanded] = useState(false)
  const { setNodeRef: setToggleRef, isOver: isOverToggle } = useDroppable({ id: 'mini-calendar-toggle' })

  // Latched, not live: once expanded because the drag touched the toggle,
  // stay open until the drag itself ends — not just until the pointer
  // leaves. Otherwise, the moment the pointer moves off the collapsed
  // button and onto one of the (now-rendered) day cells inside it, dnd-kit
  // resolves `over` to that more specific cell instead of the toggle, so a
  // live `isDragging && isOverToggle` check would immediately flip back to
  // false and the calendar would collapse out from under the cursor right
  // as the user tries to drop on a day.
  const [openedByDrag, setOpenedByDrag] = useState(false)
  useEffect(() => {
    if (isDragging && isOverToggle) setOpenedByDrag(true)
    if (!isDragging) setOpenedByDrag(false)
  }, [isDragging, isOverToggle])

  const expanded = manuallyExpanded || openedByDrag

  if (!expanded) {
    return (
      <button
        ref={setToggleRef}
        type="button"
        className={`mini-calendar mini-calendar-collapsed ${isOverToggle ? 'drop-target-active' : ''}`}
        onClick={() => setManuallyExpanded(true)}
        aria-label="Open calendar"
        title="Open calendar"
      >
        <span aria-hidden="true">📅</span>
      </button>
    )
  }

  return (
    <div className="mini-calendar" ref={setToggleRef}>
      <div className="mini-calendar-header">
        <button className="icon-button" onClick={goToPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span className="mini-calendar-month-label">{format(monthAnchor, 'MMMM yyyy')}</span>
        <button className="icon-button" onClick={goToNextMonth} aria-label="Next month">
          ›
        </button>
        {!openedByDrag && (
          <button
            className="icon-button"
            onClick={() => setManuallyExpanded(false)}
            aria-label="Collapse calendar"
            title="Collapse calendar"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mini-calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="mini-calendar-weekday">
            {d}
          </div>
        ))}
        {days.map((day) => (
          <DayCell key={day.toISOString()} day={day} monthAnchor={monthAnchor} />
        ))}
      </div>
      <p className="mini-calendar-hint">Drag a backlog item onto a day to schedule it.</p>
    </div>
  )
}
