/**
 * A cleared rich-text editor often still holds markup like '<p><br></p>'
 * rather than a literal empty string, so a plain truthy/trim check treats it
 * as "has content." This strips tags/entities first to check for real text.
 * @param {string|null|undefined} html
 */
export function isRichTextEmpty(html) {
  if (!html) return true
  const stripped = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  return stripped.length === 0
}
