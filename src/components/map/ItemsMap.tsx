import "leaflet/dist/leaflet.css"
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet"
import { Link } from "react-router"
import { KIBERA_CENTER } from "@/lib/coordinates"
import { cn } from "@/lib/utils"
import type { MapItem } from "./mapItems"

// Heavy (Leaflet): always import this with React.lazy.
export default function ItemsMap({ items, className }: { items: MapItem[]; className?: string }) {
  // A single item (detail pages) is centered and zoomed in; otherwise show Kibera.
  const single = items.length === 1 ? items[0] : null
  const center: [number, number] = single ? [single.latitude, single.longitude] : KIBERA_CENTER

  return (
    <MapContainer center={center} zoom={single ? 16 : 15} className={cn("z-0 h-80 w-full rounded-xl", className)}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => (
        <CircleMarker
          key={item.key}
          center={[item.latitude, item.longitude]}
          radius={9}
          pathOptions={{ color: "white", weight: 2, fillColor: item.color, fillOpacity: 0.9 }}
        >
          <Popup>
            <Link to={item.href} className="font-semibold">{item.title}</Link>
            {item.subtitle && <div>{item.subtitle}</div>}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
