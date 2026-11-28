import { describe, expect, it } from "vitest"
import { z } from "zod"
import {
  coordinateFields,
  coordinatesToForm,
  emptyToNull,
  hasCoordinates,
  parseCoordinates,
  refineCoordinates,
} from "./coordinates"

// The same shape the forms use.
const schema = z.object(coordinateFields).superRefine(refineCoordinates)

function issues(latitude: string, longitude: string) {
  const result = schema.safeParse({ latitude, longitude })
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe("refineCoordinates", () => {
  it("accepts both empty", () => {
    expect(issues("", "")).toEqual([])
  })

  it("accepts valid coordinates", () => {
    expect(issues("-1.3133", "36.7876")).toEqual([])
  })

  it("trims whitespace", () => {
    expect(issues("  ", "  ")).toEqual([])
    expect(issues(" -1.3 ", " 36.7 ")).toEqual([])
  })

  it("requires both or neither", () => {
    expect(issues("-1.3", "")).toEqual(["Set both latitude and longitude, or neither."])
    expect(issues("", "36.7")).toEqual(["Set both latitude and longitude, or neither."])
  })

  it("puts the both-or-neither error on the latitude field", () => {
    const result = schema.safeParse({ latitude: "", longitude: "36.7" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(["latitude"])
  })

  it("rejects latitude out of range or not a number", () => {
    const message = "Latitude must be a number between -90 and 90."
    expect(issues("91", "36.7")).toEqual([message])
    expect(issues("-90.1", "36.7")).toEqual([message])
    expect(issues("abc", "36.7")).toEqual([message])
  })

  it("rejects longitude out of range or not a number", () => {
    const message = "Longitude must be a number between -180 and 180."
    expect(issues("-1.3", "181")).toEqual([message])
    expect(issues("-1.3", "abc")).toEqual([message])
  })

  it("accepts the range limits", () => {
    expect(issues("90", "180")).toEqual([])
    expect(issues("-90", "-180")).toEqual([])
  })
})

describe("parseCoordinates", () => {
  it("returns nulls when empty", () => {
    expect(parseCoordinates({ latitude: "", longitude: "" })).toEqual({ latitude: null, longitude: null })
  })

  it("converts strings to numbers", () => {
    expect(parseCoordinates({ latitude: "-1.3133", longitude: "36.7876" })).toEqual({
      latitude: -1.3133,
      longitude: 36.7876,
    })
  })
})

describe("coordinatesToForm", () => {
  it("turns nulls into empty strings", () => {
    expect(coordinatesToForm({ latitude: null, longitude: null })).toEqual({ latitude: "", longitude: "" })
  })

  it("round-trips with parseCoordinates", () => {
    const item = { latitude: -1.3133, longitude: 36.7876 }
    expect(parseCoordinates(coordinatesToForm(item))).toEqual(item)
  })
})

describe("hasCoordinates", () => {
  it("is true only when both are set", () => {
    expect(hasCoordinates({ latitude: -1.3, longitude: 36.7 })).toBe(true)
    expect(hasCoordinates({ latitude: -1.3, longitude: null })).toBe(false)
    expect(hasCoordinates({ latitude: null, longitude: 36.7 })).toBe(false)
    expect(hasCoordinates({ latitude: null, longitude: null })).toBe(false)
  })

  it("treats 0 as a valid coordinate", () => {
    expect(hasCoordinates({ latitude: 0, longitude: 0 })).toBe(true)
  })
})

describe("emptyToNull", () => {
  it("turns empty or blank strings into null", () => {
    expect(emptyToNull("")).toBeNull()
    expect(emptyToNull("   ")).toBeNull()
  })

  it("trims other strings", () => {
    expect(emptyToNull("  Kibera  ")).toBe("Kibera")
  })
})
