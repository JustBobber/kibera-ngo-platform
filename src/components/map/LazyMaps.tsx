import { lazy, Suspense, type ComponentProps } from "react"

// Leaflet is heavy, so map components are only downloaded when they are shown.
const ItemsMapLazy = lazy(() => import("./ItemsMap"))
const LocationPickerLazy = lazy(() => import("./LocationPicker"))

function MapFallback({ className = "h-80" }: { className?: string }) {
  return <div className={`${className} w-full animate-pulse rounded-xl bg-muted`} />
}

export function ItemsMap(props: ComponentProps<typeof ItemsMapLazy>) {
  return (
    <Suspense fallback={<MapFallback className={props.className} />}>
      <ItemsMapLazy {...props} />
    </Suspense>
  )
}

export function LocationPicker(props: ComponentProps<typeof LocationPickerLazy>) {
  return (
    <Suspense fallback={<MapFallback className="h-64" />}>
      <LocationPickerLazy {...props} />
    </Suspense>
  )
}
