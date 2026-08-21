import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { _resetDbForTests } from '../db.js'
import * as repo from '../index.js'
import { getOccurrencesBetween, ensureInstancesGenerated, regenerateFutureInstances } from '../recurrence.js'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  _resetDbForTests()
})

describe('getOccurrencesBetween', () => {
  it('daily every N days', () => {
    const rule = { freq: 'daily', interval: 2, byWeekday: null, startDate: '2026-08-01', endDate: null, time: '09:00' }
    const occ = getOccurrencesBetween(rule, '2026-08-01', '2026-08-08')
    expect(occ).toEqual(['2026-08-01', '2026-08-03', '2026-08-05', '2026-08-07'])
  })

  it('weekly on specific weekdays with interval', () => {
    // 2026-08-03 is a Monday
    const rule = {
      freq: 'weekly',
      interval: 2,
      byWeekday: [1, 3], // Mon, Wed
      startDate: '2026-08-03',
      endDate: null,
      time: null,
    }
    const occ = getOccurrencesBetween(rule, '2026-08-03', '2026-08-24')
    // week of 8/3 (included), skip week of 8/10, include week of 8/17
    expect(occ).toEqual(['2026-08-03', '2026-08-05', '2026-08-17', '2026-08-19'])
  })

  it('monthly on the same day-of-month', () => {
    const rule = { freq: 'monthly', interval: 1, byWeekday: null, startDate: '2026-08-15', endDate: null, time: null }
    const occ = getOccurrencesBetween(rule, '2026-08-01', '2026-11-01')
    expect(occ).toEqual(['2026-08-15', '2026-09-15', '2026-10-15'])
  })

  it('respects rule endDate', () => {
    const rule = { freq: 'daily', interval: 1, byWeekday: null, startDate: '2026-08-01', endDate: '2026-08-03', time: null }
    const occ = getOccurrencesBetween(rule, '2026-08-01', '2026-08-10')
    expect(occ).toEqual(['2026-08-01', '2026-08-02', '2026-08-03'])
  })
})

describe('ensureInstancesGenerated', () => {
  it('is idempotent — calling twice does not duplicate instances', async () => {
    const item = await repo.saveItem({
      title: 'Standup',
      isUnscheduled: false,
      recurrence: {
        freq: 'daily',
        interval: 1,
        byWeekday: null,
        startDate: '2026-08-19',
        endDate: '2026-08-21',
        time: '09:00',
      },
    })

    await ensureInstancesGenerated(item, '2026-08-19', 5)
    await ensureInstancesGenerated(item, '2026-08-19', 5)

    const instances = await repo.getInstancesForItem(item.id)
    expect(instances).toHaveLength(3)
  })
})

describe('regenerateFutureInstances', () => {
  it('leaves finalized instances alone and regenerates the rest', async () => {
    const item = await repo.saveItem({
      title: 'Standup',
      isUnscheduled: false,
      recurrence: {
        freq: 'daily',
        interval: 1,
        byWeekday: null,
        startDate: '2026-08-17',
        endDate: '2026-08-21',
        time: '09:00',
      },
    })
    await ensureInstancesGenerated(item, '2026-08-17', 10)

    const before = await repo.getInstancesForItem(item.id)
    const pastInst = before.find((i) => i.date === '2026-08-17')
    await repo.saveInstance({ ...pastInst, finalized: true, status: 'completed' })

    const updatedItem = await repo.saveItem({ id: item.id, durationMinutes: 45 })
    await regenerateFutureInstances(updatedItem, '2026-08-18')

    const after = await repo.getInstancesForItem(item.id)
    const stillFinalized = after.find((i) => i.date === '2026-08-17')
    expect(stillFinalized.finalized).toBe(true)

    const regenerated = after.find((i) => i.date === '2026-08-19')
    expect(regenerated.durationMinutes).toBe(45)
  })
})
