import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/EventCard"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { useEvents } from "@/api/events"
import { isSameDay } from "@/lib/format"

export function HomePage() {
  const events = useEvents()
  const [selectedDay, setSelectedDay] = useState<Date | undefined>()
  const [startOfToday] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const allEvents = events.data ?? []
  const shownEvents = selectedDay
    ? allEvents.filter((e) => isSameDay(new Date(e.date), selectedDay))
    : allEvents.filter((e) => new Date(e.date) >= startOfToday)
  const eventDays = allEvents.map((e) => new Date(e.date))

  return (
    <Page tone="green">
      <p className="mb-6 max-w-2xl text-muted-foreground">
        See what NGOs are doing in Kibera: upcoming events, ongoing projects and the organizations behind them.
      </p>
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold">
              {selectedDay
                ? `Happenings on ${selectedDay.toLocaleDateString(undefined, { day: "numeric", month: "long" })}`
                : "Kibera happenings"}
            </h1>
            {selectedDay && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDay(undefined)}>
                Show all upcoming
              </Button>
            )}
          </div>
          {events.isPending ? (
            <Loading />
          ) : events.error ? (
            <ErrorMessage error={events.error} />
          ) : shownEvents.length === 0 ? (
            <p className="text-muted-foreground">No events{selectedDay ? " on this day" : " coming up"}.</p>
          ) : (
            <ul className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
              {shownEvents.map((event) => (
                <li key={event.id}><EventCard event={event} /></li>
              ))}
            </ul>
          )}
        </section>
        <section className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 text-xl font-bold">Calendar</h2>
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={{ hasEvent: eventDays }}
            modifiersClassNames={{ hasEvent: "font-bold text-sky-700 underline underline-offset-4" }}
            className="rounded-lg"
          />
          <p className="mt-2 text-xs text-muted-foreground">Days with events are underlined.</p>
        </section>
      </div>
    </Page>
  )
}
