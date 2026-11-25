import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormError, FormField } from "@/components/FormField"
import { CoordinateFields } from "@/components/CoordinateFields"
import { coordinateFields, coordinatesToForm, emptyToNull, parseCoordinates, refineCoordinates } from "@/lib/coordinates"
import type { Tables, TablesInsert } from "@/types/database"

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string(),
    contact_email: z.union([z.literal(""), z.email("Enter a valid email")]),
    contact_phone: z.string(),
    website: z.string(),
    ...coordinateFields,
  })
  .superRefine(refineCoordinates)

type FormValues = z.infer<typeof schema>

/** Used to create an NGO (platform admin) and to edit an NGO profile (members). */
export function NgoForm({
  ngo,
  submitLabel,
  onSubmit,
  error,
  pending,
}: {
  ngo?: Tables<"ngos">
  submitLabel: string
  onSubmit: (row: TablesInsert<"ngos">) => void
  error: unknown
  pending: boolean
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: ngo?.name ?? "",
      description: ngo?.description ?? "",
      contact_email: ngo?.contact_email ?? "",
      contact_phone: ngo?.contact_phone ?? "",
      website: ngo?.website ?? "",
      ...(ngo ? coordinatesToForm(ngo) : { latitude: "", longitude: "" }),
    },
  })
  const { errors } = form.formState
  const [latitude, longitude] = useWatch({ control: form.control, name: ["latitude", "longitude"] })

  function submit(v: FormValues) {
    onSubmit({
      name: v.name,
      description: emptyToNull(v.description),
      contact_email: emptyToNull(v.contact_email),
      contact_phone: emptyToNull(v.contact_phone),
      website: emptyToNull(v.website),
      ...parseCoordinates(v),
    })
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid max-w-2xl gap-4 rounded-2xl bg-white p-4 md:p-6">
      <FormField label="Name" htmlFor="ngo-name" error={errors.name?.message}>
        <Input id="ngo-name" {...form.register("name")} />
      </FormField>
      <FormField label="Description" htmlFor="ngo-description">
        <Textarea id="ngo-description" rows={4} {...form.register("description")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact email" htmlFor="ngo-email" error={errors.contact_email?.message}>
          <Input id="ngo-email" type="email" {...form.register("contact_email")} />
        </FormField>
        <FormField label="Contact phone" htmlFor="ngo-phone">
          <Input id="ngo-phone" type="tel" {...form.register("contact_phone")} />
        </FormField>
      </div>
      <FormField label="Website" htmlFor="ngo-website">
        <Input id="ngo-website" placeholder="https://…" {...form.register("website")} />
      </FormField>
      <CoordinateFields
        value={{ latitude, longitude }}
        onChange={(v) => {
          form.setValue("latitude", v.latitude)
          form.setValue("longitude", v.longitude)
        }}
        errors={{ latitude: errors.latitude?.message, longitude: errors.longitude?.message }}
      />
      <FormError error={error} />
      <div>
        <Button type="submit" disabled={pending}>{submitLabel}</Button>
      </div>
    </form>
  )
}
