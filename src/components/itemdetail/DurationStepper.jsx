import { timeStrToMinutes, minutesToTimeStr, formatTimeLabel } from '../../utils/dateUtils.js'

export function DurationStepper({ durationMinutes, onChange, startTime }) {
  const isReminder = durationMinutes === null

  // Stepping below 10 minutes drops into "no duration" (a reminder) instead
  // of a separate toggle — decrement past the floor, increment back out of it.
  const decrement = () => {
    if (isReminder) return
    onChange(durationMinutes <= 10 ? null : durationMinutes - 10)
  }
  const increment = () => onChange(isReminder ? 10 : durationMinutes + 10)

  const endTimeLabel =
    startTime && !isReminder
      ? formatTimeLabel(minutesToTimeStr(timeStrToMinutes(startTime) + durationMinutes))
      : null

  return (
    <div className="duration-stepper">
      <div className="stepper-controls">
        <button
          type="button"
          className="icon-button"
          onClick={decrement}
          disabled={isReminder}
          aria-label="Decrease duration by 10 minutes"
        >
          −
        </button>
        <span className="stepper-value">
          {isReminder ? 'No duration (reminder)' : formatDuration(durationMinutes)}
        </span>
        <button
          type="button"
          className="icon-button"
          onClick={increment}
          aria-label="Increase duration by 10 minutes"
        >
          +
        </button>
      </div>
      {endTimeLabel && <span className="stepper-end-time">ends {endTimeLabel}</span>}
    </div>
  )
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}
