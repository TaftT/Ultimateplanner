import { useCategories } from '../../hooks/useCategories.js'

export function CategoryPicker({ categoryId, onChange }) {
  const categories = useCategories()

  return (
    <select
      className="category-picker"
      value={categoryId ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">No category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
