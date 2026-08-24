import { useNavigate } from 'react-router-dom'
import { TopBar } from '../layout/TopBar.jsx'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useInstancesForDate } from '../../hooks/useInstancesForDate.js'
import { todayStr, formatDayHeading } from '../../utils/dateUtils.js'

export function HomePage() {
  const navigate = useNavigate()
  const today = todayStr()
  const items = useEntityStore((s) => s.items)
  const todayInstances = useInstancesForDate(today)
  const backlogCount = items.filter((i) => i.isUnscheduled).length

  return (
    <div className="home-page">
      <TopBar />
      <div className="home-content">
        <h1>{formatDayHeading(today)}</h1>
        <div className="home-cards">
          <button className="home-card" onClick={() => navigate(`/day/${today}`)}>
            <span className="home-card-title">Today</span>
            <span className="home-card-count">
              {todayInstances.length} scheduled
            </span>
          </button>
          <button className="home-card" onClick={() => navigate('/backlog')}>
            <span className="home-card-title">Backlog</span>
            <span className="home-card-count">{backlogCount} unscheduled</span>
          </button>
          <button className="home-card" onClick={() => navigate('/stats')}>
            <span className="home-card-title">Stats</span>
            <span className="home-card-count">Habits &amp; history</span>
          </button>
        </div>
      </div>
    </div>
  )
}
