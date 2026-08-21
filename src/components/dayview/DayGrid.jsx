import { useRef } from 'react'
import { HourRow } from './HourRow.jsx'
import { InstanceBlock } from './InstanceBlock.jsx'
import { OvernightContinuationBlock } from './OvernightContinuationBlock.jsx'
import { CurrentTimeIndicator } from './CurrentTimeIndicator.jsx'
import { DAY_HEIGHT } from './gridConstants.js'
import { pxOffsetToTimeStr } from '../../utils/dnd/timeFromPointer.js'
import { isTodayStr } from '../../utils/dateUtils.js'
import { useAppStore } from '../../store/useAppStore.js'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function DayGrid({ instances, date, continuations = [] }) {
  const gridRef = useRef(null)
  const openModal = useAppStore((s) => s.openModal)

  const timedInstances = instances.filter((i) => !i.isAllDay)

  const handleGridClick = (e) => {
    if (e.target.closest('.instance-block')) return
    const rect = gridRef.current.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const time = pxOffsetToTimeStr(offsetY)
    openModal('itemDetail', { itemId: null, date, time })
  }

  return (
    <div className="day-grid" ref={gridRef} style={{ height: DAY_HEIGHT }} onClick={handleGridClick}>
      {HOURS.map((hour) => (
        <HourRow key={hour} hour={hour} />
      ))}
      {isTodayStr(date) && <CurrentTimeIndicator />}
      {continuations.map((c) => (
        <OvernightContinuationBlock key={`continuation-${c.id}`} continuation={c} />
      ))}
      {timedInstances.map((instance) => (
        <InstanceBlock key={instance.id} instance={instance} date={date} />
      ))}
    </div>
  )
}
