export function formatDateTime(value: any): string {
  if (!value) return 'Unknown time'

  let date: Date | null = null

  if (typeof value?.toDate === 'function') {
    date = value.toDate()
  } else if (typeof value?.seconds === 'number') {
    date = new Date(value.seconds * 1000)
  } else {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) date = parsed
  }

  if (!date) return 'Unknown time'

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
