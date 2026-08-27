import { useNavigate } from 'react-router-dom'
import { TopBar } from '../layout/TopBar.jsx'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useInstancesForDate } from '../../hooks/useInstancesForDate.js'
import { todayStr } from '../../utils/dateUtils.js'

const FEATURES = [
  {
    icon: '🗓️',
    title: 'Day view',
    body: 'See your day as a visual timeline instead of a flat list. Drag tasks to reschedule them, mark progress as you go, and overnight items like sleep flow naturally into the next day.',
  },
  {
    icon: '📋',
    title: 'Backlog',
    body: "Keep unscheduled tasks in a holding area and drag them onto a day whenever you're ready — nothing has to be scheduled the moment you think of it.",
  },
  {
    icon: '⟳',
    title: 'Recurring tasks & habits',
    body: 'Set up daily, weekly, or monthly routines once. Track them as habits on the Stats page to see your current streak, longest streak, and completion rate.',
  },
  {
    icon: '📓',
    title: 'Daily journal',
    body: 'Log your mood and notes for each day, right alongside your schedule.',
  },
  {
    icon: '🎨',
    title: 'Categories',
    body: 'Color-code items by category so your day is easy to scan at a glance.',
  },
  {
    icon: '☁️',
    title: 'Optional encrypted cloud sync',
    body: 'Everything works fully offline by default. Sign in and mark an item "Sync to cloud" to carry it across your devices — it’s encrypted on your device before it ever leaves, with a key derived from your password, so it stays unreadable to anyone else.',
  },
]

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
        <section className="home-hero">
          <h1>DayIntent</h1>
          <p className="home-tagline">
            A day-by-day planner that keeps your schedule, your backlog, and your habits in one place —
            time-blocked like a calendar, flexible like a to-do list.
          </p>
        </section>

        <section className="home-features">
          {FEATURES.map((f) => (
            <div className="home-feature" key={f.title}>
              <span className="home-feature-icon" aria-hidden="true">{f.icon}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="home-start">
          <h2>Jump in</h2>
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
        </section>
      </div>
    </div>
  )
}
