import { BacklogListItem } from './BacklogListItem.jsx'
import { BacklogInstanceRow } from './BacklogInstanceRow.jsx'
import { useBacklogItems } from '../../hooks/useBacklogItems.js'
import { useAppStore } from '../../store/useAppStore.js'

export function BacklogList() {
  const filters = useAppStore((s) => s.backlogFilters)
  const rows = useBacklogItems(filters)

  if (rows.length === 0) {
    return <div className="empty-state">Nothing in the backlog. Drag items here or create a new one.</div>
  }

  return (
    <div className="backlog-list">
      {rows.map((row) =>
        row.type === 'instance' ? (
          <BacklogInstanceRow key={row.instance.id} item={row.item} instance={row.instance} />
        ) : (
          <BacklogListItem key={row.item.id} item={row.item} />
        )
      )}
    </div>
  )
}
