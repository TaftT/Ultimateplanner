import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
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

  // BacklogInstanceRow (a recurring item's next occurrence) isn't draggable,
  // so only the plain-item rows participate in the sortable set.
  const sortableIds = rows.filter((row) => row.type === 'item').map((row) => row.item.id)

  return (
    <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
      <div className="backlog-list">
        {rows.map((row) =>
          row.type === 'instance' ? (
            <BacklogInstanceRow key={row.instance.id} item={row.item} instance={row.instance} />
          ) : (
            <BacklogListItem key={row.item.id} item={row.item} />
          )
        )}
      </div>
    </SortableContext>
  )
}
