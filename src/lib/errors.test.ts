import { describe, expect, it } from "vitest"
import { errorMessage } from "./errors"

describe("errorMessage", () => {
  it("reads the message of an Error", () => {
    expect(errorMessage(new Error("Boom"))).toBe("Boom")
  })

  it("reads the message of a plain object (Supabase errors)", () => {
    expect(errorMessage({ message: "permission denied", code: "42501" })).toBe("permission denied")
  })

  it("falls back for anything else", () => {
    expect(errorMessage("text")).toBe("Something went wrong.")
    expect(errorMessage(null)).toBe("Something went wrong.")
    expect(errorMessage(undefined)).toBe("Something went wrong.")
    expect(errorMessage({ message: 1 })).toBe("Something went wrong.")
  })
})
