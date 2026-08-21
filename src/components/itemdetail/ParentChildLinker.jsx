import { useState } from 'react'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'

function LinkedItemChip({ linked, onUnlink }) {
  const openModal = useAppStore((s) => s.openModal)
  return (
    <div className="linked-item-chip" onClick={() => openModal('itemDetail', { itemId: linked.id })}>
      {linked.recurrence ? (
        <span className="linked-item-recurring" title="Recurring">⟳</span>
      ) : (
        <span className="linked-item-percent">{linked.percentComplete}%</span>
      )}
      <span className="linked-item-title">{linked.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onUnlink()
        }}
        aria-label="Unlink"
      >
        ✕
      </button>
    </div>
  )
}

export function ParentChildLinker({ item }) {
  const items = useEntityStore((s) => s.items)
  const linkParentChild = useEntityStore((s) => s.linkParentChild)
  const unlinkParentChild = useEntityStore((s) => s.unlinkParentChild)
  const [query, setQuery] = useState('')
  const [linkAs, setLinkAs] = useState('child')

  const byId = (id) => items.find((i) => i.id === id)
  const parents = item.parentIds.map(byId).filter(Boolean)
  const children = item.childIds.map(byId).filter(Boolean)
  const completedChildCount = children.filter((c) => c.percentComplete >= 100).length

  const candidates =
    query.trim().length > 0
      ? items
          .filter(
            (i) =>
              i.id !== item.id &&
              !item.parentIds.includes(i.id) &&
              !item.childIds.includes(i.id) &&
              i.title.toLowerCase().includes(query.trim().toLowerCase())
          )
          .slice(0, 6)
      : []

  return (
    <div className="parent-child-linker">
      {parents.length > 0 && (
        <div className="link-group">
          <span className="link-group-label">Parent of this task</span>
          {parents.map((p) => (
            <LinkedItemChip key={p.id} linked={p} onUnlink={() => unlinkParentChild(p.id, item.id)} />
          ))}
        </div>
      )}
      {children.length > 0 && (
        <div className="link-group">
          <span className="link-group-label">
            Subtasks ({completedChildCount}/{children.length} done)
          </span>
          {children.map((c) => (
            <LinkedItemChip key={c.id} linked={c} onUnlink={() => unlinkParentChild(item.id, c.id)} />
          ))}
        </div>
      )}

      <div className="link-add-row">
        <select value={linkAs} onChange={(e) => setLinkAs(e.target.value)}>
          <option value="child">Add subtask</option>
          <option value="parent">Add parent task</option>
        </select>
        <input
          type="text"
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {candidates.length > 0 && (
        <ul className="link-candidates">
          {candidates.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  if (linkAs === 'child') linkParentChild(item.id, c.id)
                  else linkParentChild(c.id, item.id)
                  setQuery('')
                }}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
