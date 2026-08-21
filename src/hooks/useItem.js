import { useEntityStore } from '../store/useEntityStore.js'

export function useItem(itemId) {
  return useEntityStore((s) => s.items.find((i) => i.id === itemId) ?? null)
}
