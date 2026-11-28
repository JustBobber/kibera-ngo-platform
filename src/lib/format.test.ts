import { describe, expect, it } from "vitest"
import { formatDate, isSameDay, toDateTimeLocal } from "./format"

// Output depends on the machine's locale, so tests compare against the same
// toLocale* call instead of hard-coded text.
const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }

describe("formatDate", () => {
  it("returns an empty string for missing values", () => {
    expect(formatDate(null)).toBe("")
    expect(formatDate(undefined)).toBe("")
    expect(formatDate("")).toBe("")
  })

  it("parses a plain date as a local date (no day shift)", () => {
    const expected = new Date(2026, 0, 15).toLocaleDateString(undefined, dateOptions)
    expect(formatDate("2026-01-15")).toBe(expected)
  })

  it("formats a full timestamp", () => {
    const value = "2026-06-01T12:00:00Z"
    expect(formatDate(value)).toBe(new Date(value).toLocaleDateString(undefined, dateOptions))
  })
})

describe("toDateTimeLocal", () => {
  it("returns the datetime-local input format", () => {
    expect(toDateTimeLocal("2026-06-01T12:34:56Z")).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it("keeps the local time (round-trip to the minute)", () => {
    const local = new Date(2026, 5, 1, 9, 30)
    expect(toDateTimeLocal(local.toISOString())).toBe("2026-06-01T09:30")
  })
})

describe("isSameDay", () => {
  it("is true for different times on the same day", () => {
    expect(isSameDay(new Date(2026, 5, 1, 8, 0), new Date(2026, 5, 1, 23, 59))).toBe(true)
  })

  it("is false for different days", () => {
    expect(isSameDay(new Date(2026, 5, 1, 23, 59), new Date(2026, 5, 2, 0, 0))).toBe(false)
  })
})
