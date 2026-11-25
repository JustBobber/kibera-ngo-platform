import { Link, useNavigate, useParams } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { NgoForm } from "@/components/forms/NgoForm"
import { useNgo } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { TablesUpdate } from "@/types/database"

export function NgoEditPage() {
  const { id = "" } = useParams()
  const ngo = useNgo(id)
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: async (row: TablesUpdate<"ngos">) => {
      const { error } = await supabase.from("ngos").update(row).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ngos"] })
      queryClient.invalidateQueries({ queryKey: ["memberships"] })
      navigate(`/organizations/${id}`)
    },
  })

  if (auth.loading || ngo.isPending) return <Page><Loading /></Page>
  if (ngo.error) return <Page><ErrorMessage error={ngo.error} /></Page>
  if (!ngo.data) return <Page title="Organization not found"><Link to="/organizations" className="underline">Back</Link></Page>
  if (!auth.canEditNgo(id)) return <Page title="Edit organization"><p>You don't have permission to edit this organization.</p></Page>

  return (
    <Page title={`Edit: ${ngo.data.name}`}>
      <NgoForm
        ngo={ngo.data}
        submitLabel="Save changes"
        onSubmit={(row) => update.mutate(row)}
        error={update.error}
        pending={update.isPending}
      />
    </Page>
  )
}
