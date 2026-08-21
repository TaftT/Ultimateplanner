import { useEffect } from 'react'
import { useEntityStore } from '../store/useEntityStore.js'
import { todayStr } from '../utils/dateUtils.js'
import { isRichTextEmpty } from '../utils/richText.js'

/**
 * @param {{status?: 'unscheduled'|'scheduled'|'past'|'all', categoryId?: string|null, isRecurring?: boolean, hasNotes?: boolean, searchText?: string}} filters
 * @returns {Array<{type: 'item', item: object} | {type: 'instance', item: object, instance: object}>}
 */
export function useBacklogItems(filters = {}) {
  const refreshAllInstances = useEntityStore((s) => s.refreshAllInstances)
  useEffect(() => {
    refreshAllInstances()
  }, [refreshAllInstances])

  const status = filters.status ?? 'unscheduled'

  return useEntityStore((s) => {
    // A non-finalized instance is always today-or-future (rollover only
    // finalizes once a day is in the past), so this set is exactly "items
    // with something upcoming on the calendar."
    const upcomingItemIds = new Set(
      s.allInstances.filter((i) => !i.finalized).map((i) => i.itemId)
    )

    const matchingItems = s.items.filter((item) => {
      const isUpcoming = upcomingItemIds.has(item.id)
      if (status === 'unscheduled' && !item.isUnscheduled) return false
      if (status === 'scheduled' && (item.isUnscheduled || !isUpcoming)) return false
      if (status === 'past' && (item.isUnscheduled || isUpcoming)) return false
      if (filters.categoryId && item.categoryId !== filters.categoryId) return false
      if (filters.isRecurring !== undefined && Boolean(item.recurrence) !== filters.isRecurring) {
        return false
      }
      if (filters.hasNotes && isRichTextEmpty(item.notes)) return false
      if (filters.searchText && filters.searchText.trim()) {
        const q = filters.searchText.trim().toLowerCase()
        const matches =
          item.title.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })

    matchingItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    // A recurring item is a series, not a single task — show just its next
    // upcoming occurrence (completable on its own), not the whole series.
    if (status !== 'scheduled' && status !== 'all') {
      return matchingItems.map((item) => ({ type: 'item', item }))
    }

    const today = todayStr()

    return matchingItems.map((item) => {
      if (!item.recurrence) return { type: 'item', item }

      const nextInstance = s.allInstances
        .filter((i) => i.itemId === item.id && !i.finalized && i.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))[0]

      return nextInstance ? { type: 'instance', item, instance: nextInstance } : { type: 'item', item }
    })
  })
}
