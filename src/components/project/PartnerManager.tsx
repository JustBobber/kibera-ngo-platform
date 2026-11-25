import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { FormError, NativeSelect } from "@/components/FormField"
import { useNgos } from "@/api/ngos"
import { partnerNgos, type ProjectWithNgos } from "@/api/projects"
import { supabase } from "@/lib/supabase"

// Only shown to ngo_admins of the lead NGO (and platform admins).
export function PartnerManager({ project }: { project: ProjectWithNgos }) {
  const ngos = useNgos()
  const queryClient = useQueryClient()
  const [ngoId, setNgoId] = useState("")

  const onProject = new Set(project.project_ngos.map((pn) => pn.ngos.id))
  const available = (ngos.data ?? []).filter((ngo) => !onProject.has(ngo.id))

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["ngos"] })
  }

  const add = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_ngos").insert({ project_id: project.id, ngo_id: id, is_lead: false })
      if (error) throw error
    },
    onSuccess: () => {
      setNgoId("")
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_ngos").delete().eq("project_id", project.id).eq("ngo_id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return (
    <div className="grid gap-3 rounded-xl bg-card ring-1 ring-foreground/10 p-4">
      <h3 className="font-semibold">Manage partner NGOs</h3>
      <ul className="grid gap-2">
        {partnerNgos(project).map((ngo) => (
          <li key={ngo.id} className="flex items-center justify-between gap-2 text-sm">
            {ngo.name}
            <Button
              size="sm"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => confirm(`Remove ${ngo.name} as partner?`) && remove.mutate(ngo.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (ngoId) add.mutate(ngoId)
        }}
      >
        <NativeSelect value={ngoId} onChange={(e) => setNgoId(e.target.value)} aria-label="NGO to add as partner">
          <option value="">Choose an NGO…</option>
          {available.map((ngo) => (
            <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
          ))}
        </NativeSelect>
        <Button type="submit" disabled={!ngoId || add.isPending}>Add partner</Button>
      </form>
      <FormError error={add.error ?? remove.error} />
    </div>
  )
}
