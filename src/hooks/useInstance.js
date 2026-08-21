import { useEntityStore } from '../store/useEntityStore.js'

export function useInstance(instanceId) {
  return useEntityStore((s) => (instanceId ? s.allInstances.find((i) => i.id === instanceId) : null) ?? null)
}
