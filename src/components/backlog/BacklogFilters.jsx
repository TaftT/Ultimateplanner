import { useCategories } from '../../hooks/useCategories.js'
import { useAppStore } from '../../store/useAppStore.js'

export function BacklogFilters() {
  const categories = useCategories()
  const filters = useAppStore((s) => s.backlogFilters)
  const setBacklogFilters = useAppStore((s) => s.setBacklogFilters)

  return (
    <div className="backlog-filters">
      <input
        type="text"
        placeholder="Filter by title or notes…"
        value={filters.searchText}
        onChange={(e) => setBacklogFilters({ searchText: e.target.value })}
      />
      <select
        value={filters.status}
        onChange={(e) => setBacklogFilters({ status: e.target.value })}
      >
        <option value="unscheduled">Unscheduled</option>
        <option value="scheduled">Scheduled (upcoming)</option>
        <option value="past">Past</option>
        <option value="all">All items</option>
      </select>
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => setBacklogFilters({ categoryId: e.target.value || null })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          checked={filters.isRecurring === true}
          onChange={(e) => setBacklogFilters({ isRecurring: e.target.checked ? true : undefined })}
        />
        Recurring only
      </label>
      <label>
        <input
          type="checkbox"
          checked={filters.hasNotes}
          onChange={(e) => setBacklogFilters({ hasNotes: e.target.checked })}
        />
        Has notes
      </label>
    </div>
  )
}
