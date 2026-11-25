import "leaflet/dist/leaflet.css"
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet"
import { KIBERA_CENTER } from "@/lib/coordinates"
import { MARKER_COLORS } from "./mapItems"

function ClickHandler({ onPick }: { onPick: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click: (e) => onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))),
  })
  return null
}

// Heavy (Leaflet): always import this with React.lazy.
export default function LocationPicker({
  position,
  onPick,
}: {
  position: [number, number] | null
  onPick: (latitude: number, longitude: number) => void
}) {
  return (
    <MapContainer center={position ?? KIBERA_CENTER} zoom={15} className="z-0 h-64 w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {position && (
        <CircleMarker
          center={position}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: MARKER_COLORS.project, fillOpacity: 0.9 }}
        />
      )}
    </MapContainer>
  )
}
