import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/FormField"
import { LocationPicker } from "@/components/map/LazyMaps"
import type { CoordinateValues } from "@/lib/coordinates"

// Optional location: type coordinates or click on a map. No geocoding.
export function CoordinateFields({
  value,
  onChange,
  errors,
}: {
  value: CoordinateValues
  onChange: (value: CoordinateValues) => void
  errors?: { latitude?: string; longitude?: string }
}) {
  const [showMap, setShowMap] = useState(false)
  const lat = Number(value.latitude)
  const lng = Number(value.longitude)
  const position: [number, number] | null =
    value.latitude && value.longitude && !Number.isNaN(lat) && !Number.isNaN(lng) ? [lat, lng] : null

  return (
    <fieldset className="grid gap-3 rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">Location on map (optional)</legend>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Latitude" htmlFor="latitude" error={errors?.latitude}>
          <Input
            id="latitude"
            inputMode="decimal"
            value={value.latitude}
            onChange={(e) => onChange({ ...value, latitude: e.target.value })}
          />
        </FormField>
        <FormField label="Longitude" htmlFor="longitude" error={errors?.longitude}>
          <Input
            id="longitude"
            inputMode="decimal"
            value={value.longitude}
            onChange={(e) => onChange({ ...value, longitude: e.target.value })}
          />
        </FormField>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setShowMap((s) => !s)}>
          {showMap ? "Hide map" : "Pick on map"}
        </Button>
        {position && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ latitude: "", longitude: "" })}>
            Remove location
          </Button>
        )}
      </div>
      {showMap && (
        <>
          <p className="text-sm text-muted-foreground">Click on the map to set the location.</p>
          <LocationPicker
            position={position}
            onPick={(latitude, longitude) => onChange({ latitude: String(latitude), longitude: String(longitude) })}
          />
        </>
      )}
    </fieldset>
  )
}
