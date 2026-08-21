import { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths } from 'date-fns'
import { todayStr, fromDateStr } from '../utils/dateUtils.js'

/**
 * Shared month-grid date math for calendar UIs (mini calendar, date picker).
 * Returns the anchor month, a setter to page forward/back, and the full
 * 6-week grid of Date objects (including leading/trailing days from
 * adjacent months) needed to render a standard calendar layout.
 */
export function useMonthGridDays(initialDate = todayStr()) {
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(fromDateStr(initialDate)))

  const gridStart = startOfWeek(startOfMonth(monthAnchor))
  const gridEnd = endOfWeek(endOfMonth(monthAnchor))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return {
    monthAnchor,
    days,
    goToPrevMonth: () => setMonthAnchor((m) => addMonths(m, -1)),
    goToNextMonth: () => setMonthAnchor((m) => addMonths(m, 1)),
  }
}
