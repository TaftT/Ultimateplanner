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

export function MiniCalendarDropTarget() {
  const { monthAnchor, days, goToPrevMonth, goToNextMonth } = useMonthGridDays()

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button className="icon-button" onClick={goToPrevMonth} aria-label="Previous month">
          ‹
        </button>
        <span>{format(monthAnchor, 'MMMM yyyy')}</span>
        <button className="icon-button" onClick={goToNextMonth} aria-label="Next month">
          ›
        </button>
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
