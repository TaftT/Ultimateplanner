import { useCategoryById } from '../../hooks/useCategories.js'
import { useAppStore } from '../../store/useAppStore.js'
import { useAuthStore } from '../../store/useAuthStore.js'

export function SearchResultItem({ item }) {
  const category = useCategoryById(item.categoryId)
  const openModal = useAppStore((s) => s.openModal)
  const signedIn = useAuthStore((s) => Boolean(s.user))
  const needsUnlock = useAuthStore((s) => s.needsUnlock)
  const isLocked = signedIn && needsUnlock && item.syncEnabled

  if (isLocked) {
    return (
      <button
        className="search-result-item item-locked"
        onClick={() => openModal('itemDetail', { itemId: item.id })}
      >
        <span aria-hidden="true">🔒</span>
        <span className="search-result-title">Locked until you unlock sync</span>
      </button>
    )
  }

  return (
    <button className="search-result-item" onClick={() => openModal('itemDetail', { itemId: item.id })}>
      {category && <span className="category-dot" style={{ background: category.color }} />}
      <span className="search-result-title">{item.title}</span>
      {item.isUnscheduled && <span className="badge">Backlog</span>}
    </button>
  )
}
