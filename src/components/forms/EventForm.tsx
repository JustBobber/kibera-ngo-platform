import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormError, FormField } from "@/components/FormField"
import { CoordinateFields } from "@/components/CoordinateFields"
import { supabase } from "@/lib/supabase"
import { coordinateFields, coordinatesToForm, emptyToNull, parseCoordinates, refineCoordinates } from "@/lib/coordinates"
import { toDateTimeLocal } from "@/lib/format"
import type { Tables } from "@/types/database"

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string(),
    date: z.string().min(1, "Date and time are required"),
    location: z.string(),
    ...coordinateFields,
  })
  .superRefine(refineCoordinates)

type FormValues = z.infer<typeof schema>

export function EventForm({
  projectId,
  event,
  onDone,
}: {
  projectId: string
  event?: Tables<"events">
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: event?.name ?? "",
      description: event?.description ?? "",
      date: event ? toDateTimeLocal(event.date) : "",
      location: event?.location ?? "",
      ...(event ? coordinatesToForm(event) : { latitude: "", longitude: "" }),
    },
  })
  const { errors } = form.formState
  const [latitude, longitude] = useWatch({ control: form.control, name: ["latitude", "longitude"] })

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const row = {
        name: values.name,
        description: emptyToNull(values.description),
        date: new Date(values.date).toISOString(),
        location: emptyToNull(values.location),
        ...parseCoordinates(values),
      }
      const { error } = event
        ? await supabase.from("events").update(row).eq("id", event.id)
        : await supabase.from("events").insert({ ...row, project_id: projectId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      onDone()
    },
  })

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="grid gap-3 rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <FormField label="Event name" htmlFor="event-name" error={errors.name?.message}>
        <Input id="event-name" {...form.register("name")} />
      </FormField>
      <FormField label="Description" htmlFor="event-description">
        <Textarea id="event-description" {...form.register("description")} />
      </FormField>
      <FormField label="Date and time" htmlFor="event-date" error={errors.date?.message}>
        <Input id="event-date" type="datetime-local" {...form.register("date")} />
      </FormField>
      <FormField label="Location (text, optional)" htmlFor="event-location">
        <Input id="event-location" placeholder="e.g. Olympic Primary School" {...form.register("location")} />
      </FormField>
      <CoordinateFields
        value={{ latitude, longitude }}
        onChange={(v) => {
          form.setValue("latitude", v.latitude)
          form.setValue("longitude", v.longitude)
        }}
        errors={{ latitude: errors.latitude?.message, longitude: errors.longitude?.message }}
      />
      <FormError error={save.error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={save.isPending}>{event ? "Save event" : "Add event"}</Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}
