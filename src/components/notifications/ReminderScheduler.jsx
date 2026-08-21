import { useEffect, useRef } from 'react'
import * as repo from '../../data/index.js'
import { useAppStore } from '../../store/useAppStore.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { playNotificationSound } from '../../utils/notificationSound.js'
import { todayStr, timeStrToMinutes } from '../../utils/dateUtils.js'

const POLL_INTERVAL_MS = 20000
// If the scheduler only just started tracking a threshold that's already
// this many minutes in the past (e.g. the app was opened mid-day), treat it
// as already fired without popping a stale toast for something long over.
const FRESHNESS_WINDOW_MINUTES = 2

function nowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * Silent background poller (no visible UI of its own — see ToastContainer)
 * that watches today's scheduled instances and fires a toast + chime 10
 * minutes before start, at start, and at the scheduled finish time, so an
 * open task doesn't get forgotten. Runs regardless of which page is open.
 */
export function ReminderScheduler() {
  const addToast = useAppStore((s) => s.addToast)
  const firedRef = useRef(new Set())

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const notify = (key, kind, message, instanceId) => {
      if (firedRef.current.has(key)) return
      firedRef.current.add(key)
      const minutesPast = nowMinutes() - (Number(key.split('|')[2]) || 0)
      if (minutesPast > FRESHNESS_WINDOW_MINUTES) return // stale — don't spam on load

      addToast({ kind, message, instanceId })
      playNotificationSound(kind)
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        try {
          new Notification('PlannerApp', { body: message })
        } catch {
          // Notification construction can fail in some contexts — the
          // in-app toast above already covers it.
        }
      }
    }

    const tick = async () => {
      const today = todayStr()
      const items = useEntityStore.getState().items
      const instances = await repo.getInstancesForDate(today)
      const minutesNow = nowMinutes()

      for (const instance of instances) {
        if (instance.isAllDay || !instance.time || instance.finalized) continue
        const item = items.find((i) => i.id === instance.itemId)
        if (!item) continue

        const startMinutes = timeStrToMinutes(instance.time)
        const upcomingAt = startMinutes - 10

        if (minutesNow >= upcomingAt) {
          notify(
            `${instance.id}|upcoming|${upcomingAt}`,
            'upcoming',
            `"${item.title}" starts in 10 minutes`,
            instance.id
          )
        }
        if (minutesNow >= startMinutes) {
          notify(`${instance.id}|start|${startMinutes}`, 'start', `"${item.title}" is starting now`, instance.id)
        }
        if (instance.durationMinutes != null && instance.percentComplete < 100) {
          const endMinutes = startMinutes + instance.durationMinutes
          if (minutesNow >= endMinutes) {
            notify(
              `${instance.id}|finish|${endMinutes}`,
              'finish',
              `"${item.title}" should be finishing now — mark it complete?`,
              instance.id
            )
          }
        }
      }
    }

    tick()
    const interval = setInterval(tick, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [addToast])

  return null
}
