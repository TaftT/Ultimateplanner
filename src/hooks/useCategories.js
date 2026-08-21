import { useEntityStore } from '../store/useEntityStore.js'

export function useCategories() {
  return useEntityStore((s) => s.categories)
}

export function useCategoryById(categoryId) {
  return useEntityStore((s) => s.categories.find((c) => c.id === categoryId) ?? null)
}
