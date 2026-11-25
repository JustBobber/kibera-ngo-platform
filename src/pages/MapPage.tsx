import { useState } from "react"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { ItemsMap } from "@/components/map/LazyMaps"
import { MARKER_COLORS, type MapItem } from "@/components/map/mapItems"
import { useEvents } from "@/api/events"
import { useNgos } from "@/api/ngos"
import { useProjects } from "@/api/projects"
import { hasCoordinates } from "@/lib/coordinates"
import { formatDateTime } from "@/lib/format"
import { ACTIVE_STATUSES, CATEGORY_LABELS } from "@/lib/labels"

type Layer = keyof typeof MARKER_COLORS

const LAYER_LABELS: Record<Layer, string> = {
  project: "Active projects",
  ngo: "Organizations",
  event: "Upcoming events",
}

// Loaded with React.lazy from App.tsx.
export default function MapPage() {
  const projects = useProjects()
  const ngos = useNgos()
  const events = useEvents()
  const [now] = useState(() => new Date())
  const [visible, setVisible] = useState<Record<Layer, boolean>>({ project: true, ngo: true, event: true })

  const error = projects.error ?? ngos.error ?? events.error
  const loading = projects.isPending || ngos.isPending || events.isPending

  // Only items that have both coordinates are shown. No fallback positions.
  const items: MapItem[] = []
  if (visible.project) {
    for (const p of (projects.data ?? []).filter(hasCoordinates)) {
      if (!ACTIVE_STATUSES.includes(p.status)) continue
      items.push({ key: `p-${p.id}`, latitude: p.latitude, longitude: p.longitude, title: p.name, subtitle: CATEGORY_LABELS[p.category], href: `/projects/${p.id}`, color: MARKER_COLORS.project })
    }
  }
  if (visible.ngo) {
    for (const n of (ngos.data ?? []).filter(hasCoordinates)) {
      items.push({ key: `n-${n.id}`, latitude: n.latitude, longitude: n.longitude, title: n.name, subtitle: "Organization", href: `/organizations/${n.id}`, color: MARKER_COLORS.ngo })
    }
  }
  if (visible.event) {
    for (const e of (events.data ?? []).filter(hasCoordinates)) {
      if (new Date(e.date) < now) continue
      items.push({ key: `e-${e.id}`, latitude: e.latitude, longitude: e.longitude, title: e.name, subtitle: formatDateTime(e.date), href: `/projects/${e.project_id}`, color: MARKER_COLORS.event })
    }
  }

  return (
    <Page tone="green" title="Map">
      <div className="mb-3 flex flex-wrap gap-4">
        {(Object.keys(LAYER_LABELS) as Layer[]).map((layer) => (
          <label key={layer} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={visible[layer]}
              onChange={(e) => setVisible({ ...visible, [layer]: e.target.checked })}
            />
            <span className="inline-block size-3 rounded-full" style={{ backgroundColor: MARKER_COLORS[layer] }} />
            {LAYER_LABELS[layer]}
          </label>
        ))}
      </div>
      {error ? <ErrorMessage error={error} /> : loading ? <Loading /> : <ItemsMap items={items} className="h-[70vh]" />}
      <p className="mt-2 text-xs text-muted-foreground">Only items with a location are shown on the map.</p>
    </Page>
  )
}
