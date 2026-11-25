import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormError, FormField, NativeSelect } from "@/components/FormField"
import { CoordinateFields } from "@/components/CoordinateFields"
import { coordinateFields, refineCoordinates } from "@/lib/coordinates"
import { CATEGORIES, CATEGORY_LABELS, STATUSES, STATUS_LABELS } from "@/lib/labels"

const schema = z
  .object({
    ngoId: z.string(),
    name: z.string().trim().min(1, "Name is required"),
    description: z.string(),
    category: z.enum(CATEGORIES, { message: "Choose a category" }),
    status: z.enum(STATUSES),
    startDate: z.string(),
    endDate: z.string(),
    ...coordinateFields,
  })
  .superRefine(refineCoordinates)
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "End date must be on or after the start date.",
  })

export type ProjectFormValues = z.infer<typeof schema>

/**
 * Used for both creating and editing. When `ngoOptions` is given, the user
 * picks the lead NGO (create only).
 */
export function ProjectForm({
  defaultValues,
  ngoOptions,
  submitLabel,
  onSubmit,
  error,
  pending,
}: {
  defaultValues: ProjectFormValues
  ngoOptions?: { id: string; name: string }[]
  submitLabel: string
  onSubmit: (values: ProjectFormValues) => void
  error: unknown
  pending: boolean
}) {
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(schema), defaultValues })
  const { errors } = form.formState
  const [latitude, longitude] = useWatch({ control: form.control, name: ["latitude", "longitude"] })

  function submit(values: ProjectFormValues) {
    if (ngoOptions && !values.ngoId) {
      form.setError("ngoId", { message: "Choose the lead NGO" })
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="grid max-w-2xl gap-4 rounded-2xl bg-white p-4 md:p-6">
      {ngoOptions && (
        <FormField label="Lead NGO" htmlFor="ngoId" error={errors.ngoId?.message}>
          <NativeSelect id="ngoId" {...form.register("ngoId")}>
            <option value="">Choose an NGO…</option>
            {ngoOptions.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
            ))}
          </NativeSelect>
        </FormField>
      )}
      <FormField label="Project name" htmlFor="name" error={errors.name?.message}>
        <Input id="name" {...form.register("name")} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" rows={5} {...form.register("description")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" htmlFor="category" error={errors.category?.message}>
          <NativeSelect id="category" {...form.register("category")}>
            <option value="">Choose a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Status" htmlFor="status">
          <NativeSelect id="status" {...form.register("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Start date" htmlFor="startDate">
          <Input id="startDate" type="date" {...form.register("startDate")} />
        </FormField>
        <FormField label="End date" htmlFor="endDate" error={errors.endDate?.message}>
          <Input id="endDate" type="date" {...form.register("endDate")} />
        </FormField>
      </div>
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
