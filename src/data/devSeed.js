import * as repo from './index.js'
import { todayStr } from '../utils/dateUtils.js'
import { ensureInstancesGenerated } from './recurrence.js'

let seedPromise = null

/**
 * Populates the local database with sample categories/items/instances if it
 * is currently empty. Dev-only convenience so UI work isn't blocked on
 * having real data entered by hand.
 *
 * Guarded by a shared in-flight promise so React StrictMode's double-invoked
 * effect (or any other concurrent caller) can't race the empty-check and
 * seed twice.
 */
export function seedIfEmpty() {
  if (!seedPromise) {
    seedPromise = doSeed()
  }
  return seedPromise
}

async function doSeed() {
  const existingItems = await repo.getAllItems()
  if (existingItems.length > 0) return

  const work = await repo.saveCategory({ name: 'Work', color: '#3b6fe0' })
  const health = await repo.saveCategory({ name: 'Health', color: '#3ba76a' })
  const personal = await repo.saveCategory({ name: 'Personal', color: '#e0973b' })

  const today = todayStr()

  const standup = await repo.saveItem({
    title: 'Team standup',
    durationMinutes: 30,
    notes: '',
    categoryId: work.id,
    isUnscheduled: false,
    recurrence: {
      freq: 'weekly',
      interval: 1,
      byWeekday: [1, 2, 3, 4, 5],
      startDate: today,
      endDate: null,
      time: '09:00',
    },
  })
  await ensureInstancesGenerated(standup, today)

  const gym = await repo.saveItem({
    title: 'Gym',
    durationMinutes: 60,
    categoryId: health.id,
    isUnscheduled: false,
  })
  await repo.saveInstance({ itemId: gym.id, date: today, time: '17:30', durationMinutes: 60 })

  await repo.saveItem({
    title: 'Read a book',
    durationMinutes: null,
    categoryId: personal.id,
    notes: 'No fixed time, just a reminder to make time for it.',
    isUnscheduled: true,
  })

  await repo.saveItem({
    title: 'Plan Q3 roadmap',
    durationMinutes: 90,
    categoryId: work.id,
    notes: 'Needs input from design first.',
    isUnscheduled: true,
  })

  await repo.saveItem({
    title: "Mom's birthday",
    durationMinutes: null,
    isAllDay: true,
    categoryId: personal.id,
    isUnscheduled: false,
  }).then((item) => repo.saveInstance({ itemId: item.id, date: today, isAllDay: true }))
}
