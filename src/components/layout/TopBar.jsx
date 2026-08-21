import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore.js'
import { DayNavControls } from '../dayview/DayNavControls.jsx'
import { useJournal } from '../../hooks/useJournal.js'
import { isRichTextEmpty } from '../../utils/richText.js'

export function TopBar({ date }) {
  const openModal = useAppStore((s) => s.openModal)
  const toggleJournal = useAppStore((s) => s.toggleJournal)
  const currentDate = useAppStore((s) => s.currentDate)
  const dayLinkDate = date ?? currentDate
  // Loading the journal here (not just when the panel is open) lets the
  // button itself reflect whether this day already has an entry. Only
  // fetched when there's an actual day (Backlog/Stats render TopBar with no
  // date and no journal button).
  const { journal } = useJournal(date ?? null)
  const hasJournalEntry = Boolean(journal && (!isRichTextEmpty(journal.content) || journal.mood))

  return (
    <header className="top-bar">
      <div className="top-bar-left">{date && <DayNavControls date={date} />}</div>
      <nav className="top-bar-nav">
        <NavLink to={`/day/${dayLinkDate}`} className={({ isActive }) => (isActive ? 'active' : '')}>
          Day
        </NavLink>
        <NavLink to="/backlog" className={({ isActive }) => (isActive ? 'active' : '')}>
          Backlog
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => (isActive ? 'active' : '')}>
          Stats
        </NavLink>
      </nav>
      <div className="top-bar-right">
        {date && (
          <button
            className={hasJournalEntry ? 'icon-button icon-button-journal-has-entry' : 'icon-button'}
            onClick={toggleJournal}
            aria-label={hasJournalEntry ? 'Journal (entry saved for this day)' : 'Journal'}
          >
            {hasJournalEntry ? '📔' : '📓'}
          </button>
        )}
        <button className="icon-button" onClick={() => openModal('search')} aria-label="Search">
          🔍
        </button>
        <button className="icon-button" onClick={() => openModal('categoryManager')} aria-label="Categories">
          🎨
        </button>
      </div>
    </header>
  )
}
