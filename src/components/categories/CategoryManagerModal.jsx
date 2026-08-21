import { useState } from 'react'
import { Modal } from '../shared/Modal.jsx'
import { Button } from '../shared/Button.jsx'
import { CategoryListItem } from './CategoryListItem.jsx'
import { useCategories } from '../../hooks/useCategories.js'
import { useEntityStore } from '../../store/useEntityStore.js'
import { useAppStore } from '../../store/useAppStore.js'
import { CATEGORY_COLOR_SWATCHES } from '../../utils/colorUtils.js'

export function CategoryManagerModal() {
  const categories = useCategories()
  const saveCategory = useEntityStore((s) => s.saveCategory)
  const closeModal = useAppStore((s) => s.closeModal)
  const [newName, setNewName] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    const color = CATEGORY_COLOR_SWATCHES[categories.length % CATEGORY_COLOR_SWATCHES.length]
    await saveCategory({ name: newName.trim(), color })
    setNewName('')
  }

  return (
    <Modal title="Categories" onClose={closeModal}>
      <div className="category-manager">
        {categories.map((c) => (
          <CategoryListItem key={c.id} category={c} />
        ))}
        <div className="category-add-row">
          <input
            type="text"
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button variant="primary" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  )
}
