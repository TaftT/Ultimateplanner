import { useCategoryById } from '../../hooks/useCategories.js'
import { useAppStore } from '../../store/useAppStore.js'

export function SearchResultItem({ item }) {
  const category = useCategoryById(item.categoryId)
  const openModal = useAppStore((s) => s.openModal)

  return (
    <button className="search-result-item" onClick={() => openModal('itemDetail', { itemId: item.id })}>
      {category && <span className="category-dot" style={{ background: category.color }} />}
      <span className="search-result-title">{item.title}</span>
      {item.isUnscheduled && <span className="badge">Backlog</span>}
    </button>
  )
}
