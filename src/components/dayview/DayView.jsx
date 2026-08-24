import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { TopBar } from '../layout/TopBar.jsx'
import { AllDayRow } from './AllDayRow.jsx'
import { DayGrid } from './DayGrid.jsx'
import { JournalPanel } from '../journal/JournalPanel.jsx'
import { useInstancesForDate } from '../../hooks/useInstancesForDate.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { usePlannerSensors } from '../../utils/dnd/dndContextConfig.js'
import { applyDeltaToTime } from '../../utils/dnd/timeFromPointer.js'
import { todayStr, addDaysStr, timeStrToMinutes } from '../../utils/dateUtils.js'

// Minimum horizontal travel (px) to count as a swipe, not a tap/scroll.
const SWIPE_THRESHOLD_PX = 60
// Swipe must be mostly horizontal — this many times more horizontal than
// vertical travel — so a vertical scroll flick never gets mistaken for one.
const SWIPE_DIRECTION_RATIO = 1.5
// Swipes slower than this (ms) read as a drag, not a flick, and are ignored.
const SWIPE_MAX_DURATION_MS = 800

export function DayView() {
  const { date: dateParam } = useParams()
  const date = dateParam || todayStr()
  const navigate = useNavigate()
  const touchStartRef = useRef(null)
  const instances = useInstancesForDate(date)
  const previousDate = addDaysStr(date, -1)
  const previousInstances = useInstancesForDate(previousDate)
  // An overnight item (e.g. sleep) scheduled yesterday can run past
  // midnight — the leftover minutes show as a continuation block at the
  // top of today's grid.
  const continuations = previousInstances
    .filter((i) => !i.isAllDay && i.time && i.durationMinutes != null)
    .map((i) => ({
      ...i,
      overflowMinutes: timeStrToMinutes(i.time) + i.durationMinutes - 1440,
      originalDate: previousDate,
    }))
    .filter((i) => i.overflowMinutes > 0)
  const moveInstanceTime = useEntityStore((s) => s.moveInstanceTime)
  const journalOpen = useAppStore((s) => s.journalOpen)
  const setCurrentDate = useAppStore((s) => s.setCurrentDate)
  const sensors = usePlannerSensors()

  // Remember the last-viewed day so navigating back from the Backlog page
  // (which has no date of its own) returns here instead of a dateless route.
  useEffect(() => {
    setCurrentDate(date)
  }, [date, setCurrentDate])

  const handleDragEnd = (event) => {
    const { active, delta } = event
    const instance = active.data.current?.instance
    if (!instance || instance.isAllDay) return
    const duration = instance.durationMinutes ?? 30
    const newTime = applyDeltaToTime(instance.time, delta.y, duration)
    if (newTime !== instance.time) {
      moveInstanceTime(instance.id, newTime)
    }
  }

  // Swipe left/right anywhere on the day view to move to the next/previous
  // day, mirroring the prev/next buttons in DayNavControls. Passive
  // start/end tracking only — never calls preventDefault, so normal
  // vertical scrolling of the grid is untouched.
  const handleTouchStart = (event) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    const elapsed = Date.now() - start.time
    if (
      elapsed > SWIPE_MAX_DURATION_MS ||
      Math.abs(dx) < SWIPE_THRESHOLD_PX ||
      Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO
    ) {
      return
    }
    navigate(`/day/${addDaysStr(date, dx < 0 ? 1 : -1)}`)
  }

  return (
    <div className="day-view" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <TopBar date={date} />
      <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <AllDayRow instances={instances} date={date} />
        <div className="day-scroll-area">
          <DayGrid instances={instances} date={date} continuations={continuations} />
        </div>
      </DndContext>
      {journalOpen && <JournalPanel date={date} />}
    </div>
  )
}
