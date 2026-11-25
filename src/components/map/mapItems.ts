// Shared types and colors for map markers. Kept separate from the Leaflet code
// so pages can build marker lists without loading Leaflet.

export type MapItem = {
  key: string
  latitude: number
  longitude: number
  title: string
  subtitle?: string
  href: string
  color: string
}

export const MARKER_COLORS = {
  project: "#ea580c", // orange
  ngo: "#db2777", // pink
  event: "#2563eb", // blue
}
