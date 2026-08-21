import { addDaysStr, todayStr } from './dateUtils.js'

const HISTORY_DAYS = 30

/**
 * Computes habit statistics for one item from its finalized instance
 * history: completion rate, current streak, longest streak, and a
 * day-by-day status strip for the last 30 days.
 * @param {string} itemId
 * @param {import('../data/types.js').ScheduledInstance[]} allInstances
 */
export function computeHabitStats(itemId, allInstances) {
  const finalized = allInstances
    .filter((i) => i.itemId === itemId && i.finalized)
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalOccurrences = finalized.length
  const completedCount = finalized.filter((i) => i.status === 'completed').length
  const completionRate = totalOccurrences === 0 ? 0 : Math.round((completedCount / totalOccurrences) * 100)

  let currentStreak = 0
  for (let i = finalized.length - 1; i >= 0; i--) {
    if (finalized[i].status === 'completed') currentStreak++
    else break
  }

  let longestStreak = 0
  let running = 0
  for (const inst of finalized) {
    if (inst.status === 'completed') {
      running++
      longestStreak = Math.max(longestStreak, running)
    } else {
      running = 0
    }
  }

  const today = todayStr()
  const byDate = new Map(finalized.map((i) => [i.date, i.status]))
  const history = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const date = addDaysStr(today, i - (HISTORY_DAYS - 1))
    return { date, status: byDate.get(date) ?? null }
  })

  return { totalOccurrences, completedCount, completionRate, currentStreak, longestStreak, history }
}
