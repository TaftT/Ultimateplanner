// Assigns each timed instance a stagger index within its overlap cluster:
// an instance's index is one more than the highest index of any
// already-placed (earlier-starting) instance it directly overlaps. Blocks
// are processed in start-time order, so a later-starting block always ends
// up with a higher index than anything it overlaps — cascading rightward
// and rendering on top, rather than splitting into equal-width columns.
export function computeOverlapIndices(blocks) {
  const sorted = [...blocks].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id))
  const indexById = new Map()
  const placed = []
  for (const block of sorted) {
    let maxIndex = -1
    for (const p of placed) {
      if (p.end > block.start && p.start < block.end) {
        maxIndex = Math.max(maxIndex, p.index)
      }
    }
    const index = maxIndex + 1
    indexById.set(block.id, index)
    placed.push({ ...block, index })
  }
  return indexById
}
