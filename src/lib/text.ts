export function toSentenceCase(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim().replace(/\s+/g, ' ')
  if (!trimmed) return null
  return trimmed
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
