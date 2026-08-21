import { useState } from 'react'
import { Modal } from '../shared/Modal.jsx'
import { SearchResultItem } from './SearchResultItem.jsx'
import { useSearch } from '../../hooks/useSearch.js'
import { useAppStore } from '../../store/useAppStore.js'

export function SearchModal() {
  const closeModal = useAppStore((s) => s.closeModal)
  const [query, setQuery] = useState('')
  const results = useSearch(query)

  return (
    <Modal title="Search" onClose={closeModal}>
      <input
        type="text"
        className="title-input"
        placeholder="Search items and notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="search-results">
        {results.map((item) => (
          <SearchResultItem key={item.id} item={item} />
        ))}
        {query.trim() && results.length === 0 && <div className="empty-state">No matches</div>}
      </div>
    </Modal>
  )
}
