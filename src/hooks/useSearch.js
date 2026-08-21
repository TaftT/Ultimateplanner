import { useEffect, useState } from 'react'
import { useEntityStore } from '../store/useEntityStore.js'

export function useSearch(query) {
  const search = useEntityStore((s) => s.search)
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query || !query.trim()) {
      setResults([])
      return
    }
    let active = true
    const handle = setTimeout(async () => {
      const found = await search(query)
      if (active) setResults(found)
    }, 200)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query, search])

  return results
}
