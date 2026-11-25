import { Link } from "react-router"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import type { EventWithProject } from "@/api/events"
import { formatDateTime } from "@/lib/format"

export function EventCard({ event }: { event: EventWithProject }) {
  return (
    <Link
      to={`/projects/${event.project_id}`}
      className="block rounded-xl border border-sky-200 bg-sky-100 p-3 text-sm transition-colors hover:bg-sky-200"
    >
      <h3 className="font-semibold">{event.name}</h3>
      {event.description && <p className="mt-1 line-clamp-2 text-muted-foreground">{event.description}</p>}
      <p className="mt-2 flex items-center gap-1 text-xs">
        <CalendarIcon className="size-3" /> {formatDateTime(event.date)}
      </p>
      {event.location && (
        <p className="mt-1 flex items-center gap-1 text-xs">
          <MapPinIcon className="size-3" /> {event.location}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">Project: {event.projects.name}</p>
    </Link>
  )
}
