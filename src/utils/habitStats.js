import { addDaysStr, todayStr } from './dateUtils.js'

const HISTORY_DAYS = 30

// When more than one item shares a day, the best outcome wins — e.g. the
// habit's own recurring instance was skipped but a same-named one-off item
// got marked complete, that day still reads as done.
const STATUS_PRIORITY = { completed: 3, worked_on: 2, ghost: 1 }

/**
 * Computes habit statistics for one item from its finalized instance
 * history: completion rate, current streak, longest streak, and a
 * day-by-day status strip for the last 30 days. Also folds in occurrences
 * from any other item that happens to share this habit's title (trimmed,
 * case-insensitive) — a one-off task named the same as a habit still counts
 * toward it, rather than needing to be the exact recurring item record.
 * @param {import('../data/types.js').Item} habitItem
 * @param {import('../data/types.js').Item[]} allItems
 * @param {import('../data/types.js').ScheduledInstance[]} allInstances
 */
export function computeHabitStats(habitItem, allItems, allInstances) {
  const normalizedTitle = habitItem.title.trim().toLowerCase()
  const matchingItemIds = new Set(
    allItems.filter((i) => i.title.trim().toLowerCase() === normalizedTitle).map((i) => i.id)
  )

  const finalized = allInstances.filter((i) => matchingItemIds.has(i.itemId) && i.finalized)

  // Merge same-titled items' occurrences onto a single per-date status
  // before computing streaks — otherwise two items landing on the same date
  // would count as two separate days instead of one.
  const statusByDate = new Map()
  for (const inst of finalized) {
    const existing = statusByDate.get(inst.date)
    if (!existing || STATUS_PRIORITY[inst.status] > STATUS_PRIORITY[existing]) {
      statusByDate.set(inst.date, inst.status)
    }
  }
  const dates = Array.from(statusByDate.keys()).sort()

  const totalOccurrences = dates.length
  const completedCount = dates.filter((d) => statusByDate.get(d) === 'completed').length
  const completionRate = totalOccurrences === 0 ? 0 : Math.round((completedCount / totalOccurrences) * 100)

  let currentStreak = 0
  for (let i = dates.length - 1; i >= 0; i--) {
    if (statusByDate.get(dates[i]) === 'completed') currentStreak++
    else break
  }

  let longestStreak = 0
  let running = 0
  for (const date of dates) {
    if (statusByDate.get(date) === 'completed') {
      running++
      longestStreak = Math.max(longestStreak, running)
    } else {
      running = 0
    }
  }

  const today = todayStr()
  const history = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const date = addDaysStr(today, i - (HISTORY_DAYS - 1))
    return { date, status: statusByDate.get(date) ?? null }
  })

  return { totalOccurrences, completedCount, completionRate, currentStreak, longestStreak, history }
}
