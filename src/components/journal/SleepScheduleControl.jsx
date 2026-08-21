import { useState } from 'react'
import { useEntityStore } from '../../store/useEntityStore.js'
import { formatTimeLabel, minutesToTimeStr, timeStrToMinutes } from '../../utils/dateUtils.js'
import { TIME_OPTIONS } from '../../utils/timeOptions.js'

const DEFAULT_BEDTIME = '23:00'
const DEFAULT_WAKE_TIME = '07:00'

export function SleepScheduleControl({ date }) {
  const setSleepSchedule = useEntityStore((s) => s.setSleepSchedule)
  const sleepItem = useEntityStore((s) => s.items.find((i) => i.title === 'Sleep'))

  const initialBedtime = sleepItem?.recurrence?.time ?? DEFAULT_BEDTIME
  const initialWakeTime =
    sleepItem?.recurrence?.time && sleepItem.durationMinutes != null
      ? minutesToTimeStr((timeStrToMinutes(sleepItem.recurrence.time) + sleepItem.durationMinutes) % 1440)
      : DEFAULT_WAKE_TIME

  const [bedtime, setBedtime] = useState(initialBedtime)
  const [wakeTime, setWakeTime] = useState(initialWakeTime)
  const [repeatNightly, setRepeatNightly] = useState(Boolean(sleepItem?.recurrence))
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = async () => {
    await setSleepSchedule({ date, bedtime, wakeTime, recurring: repeatNightly })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  return (
    <div className="sleep-schedule-control">
      <h4>🛌 Sleep</h4>
      <div className="sleep-time-row">
        <label htmlFor="sleep-bedtime">Bedtime</label>
        <select id="sleep-bedtime" value={bedtime} onChange={(e) => setBedtime(e.target.value)}>
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {formatTimeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div className="sleep-time-row">
        <label htmlFor="sleep-wake">Wake time</label>
        <select id="sleep-wake" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}>
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {formatTimeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <label className="reminder-toggle">
        <input
          type="checkbox"
          checked={repeatNightly}
          onChange={(e) => setRepeatNightly(e.target.checked)}
        />
        Repeat nightly
      </label>
      <div className="sleep-save-row">
        <button type="button" className="btn btn-subtle" onClick={handleSave}>
          Save sleep schedule
        </button>
        {justSaved && <span className="sleep-saved-hint">Saved</span>}
      </div>
    </div>
  )
}
