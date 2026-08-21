import { useState } from 'react'
import { ColorSwatchPicker } from './ColorSwatchPicker.jsx'
import { useEntityStore } from '../../store/useEntityStore.js'

export function CategoryListItem({ category }) {
  const saveCategory = useEntityStore((s) => s.saveCategory)
  const deleteCategory = useEntityStore((s) => s.deleteCategory)
  const [name, setName] = useState(category.name)

  return (
    <div className="category-list-item">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name.trim() && name !== category.name && saveCategory({ id: category.id, name })}
      />
      <ColorSwatchPicker color={category.color} onChange={(color) => saveCategory({ id: category.id, color })} />
      <button
        type="button"
        className="icon-button"
        onClick={() => deleteCategory(category.id)}
        aria-label={`Delete ${category.name}`}
      >
        🗑
      </button>
    </div>
  )
}
