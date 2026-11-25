import { lazy, Suspense, useState, type ComponentProps } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorMessage, Loading } from "@/components/Page"
import { FormError } from "@/components/FormField"
import { useProjectEvents } from "@/api/events"
import { supabase } from "@/lib/supabase"
import { formatDateTime } from "@/lib/format"

// Only NGO members edit events, so the form (react-hook-form + zod) is loaded on demand.
const LazyEventForm = lazy(() => import("@/components/forms/EventForm").then((m) => ({ default: m.EventForm })))

function EventForm(props: ComponentProps<typeof LazyEventForm>) {
  return (
    <Suspense fallback={<Loading />}>
      <LazyEventForm {...props} />
    </Suspense>
  )
}

export function ProjectEvents({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const events = useProjectEvents(projectId)
  const queryClient = useQueryClient()
  // "new" while adding, an event id while editing, null otherwise.
  const [editing, setEditing] = useState<string | null>(null)

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  })

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Events</h2>
        {canEdit && editing === null && (
          <Button size="sm" onClick={() => setEditing("new")}>Add event</Button>
        )}
      </div>
      {editing === "new" && <EventForm projectId={projectId} onDone={() => setEditing(null)} />}
      {events.isPending ? (
        <Loading />
      ) : events.error ? (
        <ErrorMessage error={events.error} />
      ) : events.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet.</p>
      ) : (
        <ul className="grid gap-3">
          {events.data.map((event) =>
            editing === event.id ? (
              <li key={event.id}>
                <EventForm projectId={projectId} event={event} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={event.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                <h3 className="font-semibold">{event.name}</h3>
                {event.description && <p className="mt-1 whitespace-pre-line">{event.description}</p>}
                <p className="mt-2 flex items-center gap-1 text-xs"><CalendarIcon className="size-3" /> {formatDateTime(event.date)}</p>
                {event.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs"><MapPinIcon className="size-3" /> {event.location}</p>
                )}
                {canEdit && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(event.id)}>Edit</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={() => confirm(`Delete the event "${event.name}"?`) && remove.mutate(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
      <FormError error={remove.error} />
    </section>
  )
}
