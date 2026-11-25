// Small date helpers. Dates are shown in the user's own locale and time zone.

export function formatDate(value: string | null | undefined): string {
  if (!value) return ""
  // A plain "YYYY-MM-DD" date has no time zone; parse it as a local date.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00`) : new Date(value)
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Converts a timestamp to the "YYYY-MM-DDTHH:mm" format used by <input type="datetime-local">.
export function toDateTimeLocal(value: string): string {
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}
