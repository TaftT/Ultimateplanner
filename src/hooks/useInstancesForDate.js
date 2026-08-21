import { useEffect } from 'react'
import { useEntityStore } from '../store/useEntityStore.js'

export function useInstancesForDate(date) {
  const instances = useEntityStore((s) => s.instancesByDate[date])
  const loadInstancesForDate = useEntityStore((s) => s.loadInstancesForDate)

  useEffect(() => {
    loadInstancesForDate(date)
  }, [date, loadInstancesForDate])

  return instances ?? []
}
