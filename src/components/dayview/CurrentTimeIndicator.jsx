import { useEffect, useState } from 'react'
import { minutesToPx } from './gridConstants.js'

export function CurrentTimeIndicator() {
  const [minutes, setMinutes] = useState(() => nowMinutes())

  useEffect(() => {
    const id = setInterval(() => setMinutes(nowMinutes()), 60_000)
    return () => clearInterval(id)
  }, [])

  return <div className="current-time-indicator" style={{ top: minutesToPx(minutes) }} />
}

function nowMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}
