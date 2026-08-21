import { HOUR_HEIGHT } from './gridConstants.js'
import { formatTimeLabel } from '../../utils/dateUtils.js'

export function HourRow({ hour }) {
  const label = formatTimeLabel(`${String(hour).padStart(2, '0')}:00`)
  return (
    <div className="hour-row" style={{ height: HOUR_HEIGHT }}>
      <div className="hour-label">{hour === 0 ? '' : label}</div>
      <div className="hour-line" />
    </div>
  )
}
