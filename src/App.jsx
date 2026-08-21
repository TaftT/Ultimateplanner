import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { DayView } from './components/dayview/DayView.jsx'
import { BacklogPage } from './components/backlog/BacklogPage.jsx'
import { StatsPage } from './components/stats/StatsPage.jsx'
import { todayStr } from './utils/dateUtils.js'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to={`/day/${todayStr()}`} replace />} />
        <Route path="/day/:date" element={<DayView />} />
        <Route path="/backlog" element={<BacklogPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </AppShell>
  )
}
