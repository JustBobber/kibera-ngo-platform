import { z } from "zod"

// Kibera, Nairobi. Used only to center maps, never as a fallback position for items.
export const KIBERA_CENTER: [number, number] = [-1.3133, 36.7876]

export type CoordinateValues = { latitude: string; longitude: string }

// Form fields: coordinates are edited as text and are optional, but both or neither must be set.
export const coordinateFields = {
  latitude: z.string().trim(),
  longitude: z.string().trim(),
}

export function refineCoordinates(values: CoordinateValues, ctx: z.RefinementCtx) {
  const { latitude, longitude } = values
  if (!latitude && !longitude) return
  if (!latitude || !longitude) {
    ctx.addIssue({ code: "custom", path: ["latitude"], message: "Set both latitude and longitude, or neither." })
    return
  }
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    ctx.addIssue({ code: "custom", path: ["latitude"], message: "Latitude must be a number between -90 and 90." })
  }
  if (Number.isNaN(lng) || lng < -180 || lng > 180) {
    ctx.addIssue({ code: "custom", path: ["longitude"], message: "Longitude must be a number between -180 and 180." })
  }
}

export function parseCoordinates(values: CoordinateValues) {
  if (!values.latitude || !values.longitude) return { latitude: null, longitude: null }
  return { latitude: Number(values.latitude), longitude: Number(values.longitude) }
}

export function coordinatesToForm(item: { latitude: number | null; longitude: number | null }): CoordinateValues {
  return {
    latitude: item.latitude?.toString() ?? "",
    longitude: item.longitude?.toString() ?? "",
  }
}

export function hasCoordinates<T extends { latitude: number | null; longitude: number | null }>(
  item: T,
): item is T & { latitude: number; longitude: number } {
  return item.latitude !== null && item.longitude !== null
}

// Empty form strings become null in the database.
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}
