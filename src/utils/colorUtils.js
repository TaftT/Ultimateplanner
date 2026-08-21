/** @param {string} hex e.g. '#3b6fe0' @returns {'#000000'|'#ffffff'} readable text color */
export function contrastTextColor(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#000000' : '#ffffff'
}

export const CATEGORY_COLOR_SWATCHES = [
  '#3b6fe0',
  '#3ba76a',
  '#e0973b',
  '#d64545',
  '#8a5fd6',
  '#3bb0c9',
  '#e0517f',
  '#7a8896',
]
