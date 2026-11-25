import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { ProjectForm, type ProjectFormValues } from "@/components/forms/ProjectForm"
import { useProject } from "@/api/projects"
import { useNgos } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { coordinatesToForm, emptyToNull, parseCoordinates } from "@/lib/coordinates"
import { supabase } from "@/lib/supabase"

export function NewProjectPage() {
  const auth = useAuth()
  const ngos = useNgos()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: async (v: ProjectFormValues) => {
      const coords = parseCoordinates(v)
      // Projects can only be created through this RPC; it makes the chosen NGO the lead.
      const { data, error } = await supabase.rpc("create_project", {
        _ngo_id: v.ngoId,
        _name: v.name,
        _category: v.category,
        _status: v.status,
        _description: emptyToNull(v.description) ?? undefined,
        _start_date: v.startDate || undefined,
        _end_date: v.endDate || undefined,
        _latitude: coords.latitude ?? undefined,
        _longitude: coords.longitude ?? undefined,
      })
      if (error) throw error
      return data
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["ngos"] })
      navigate(`/projects/${id}`)
    },
  })

  if (auth.loading || ngos.isPending) return <Page><Loading /></Page>
  if (ngos.error) return <Page><ErrorMessage error={ngos.error} /></Page>

  // Only ngo_admins (for their own NGOs) and platform admins can create projects.
  const ngoOptions = ngos.data.filter((ngo) => auth.isNgoAdmin(ngo.id))
  if (ngoOptions.length === 0) {
    return <Page title="New project"><p>Only NGO admins can create projects.</p></Page>
  }

  const preselected = searchParams.get("ngo") ?? ""
  return (
    <Page tone="sand" title="New project">
      <ProjectForm
        ngoOptions={ngoOptions}
        defaultValues={{
          ngoId: ngoOptions.some((n) => n.id === preselected) ? preselected : ngoOptions.length === 1 ? ngoOptions[0].id : "",
          name: "",
          description: "",
          category: "" as ProjectFormValues["category"],
          status: "in_planning",
          startDate: "",
          endDate: "",
          latitude: "",
          longitude: "",
        }}
        submitLabel="Create project"
        onSubmit={(v) => create.mutate(v)}
        error={create.error}
        pending={create.isPending}
      />
    </Page>
  )
}

export function EditProjectPage() {
  const { id = "" } = useParams()
  const auth = useAuth()
  const project = useProject(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: async (v: ProjectFormValues) => {
      const { error } = await supabase
        .from("projects")
        .update({
          name: v.name,
          description: emptyToNull(v.description),
          category: v.category,
          status: v.status,
          start_date: v.startDate || null,
          end_date: v.endDate || null,
          ...parseCoordinates(v),
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["ngos"] })
      navigate(`/projects/${id}`)
    },
  })

  if (auth.loading || project.isPending) return <Page><Loading /></Page>
  if (project.error) return <Page><ErrorMessage error={project.error} /></Page>
  if (!project.data) return <Page title="Project not found"><Link to="/projects" className="underline">Back to projects</Link></Page>

  const p = project.data
  const canEdit = auth.isAdmin || p.project_ngos.some((pn) => auth.canEditNgo(pn.ngos.id))
  if (!canEdit) return <Page title="Edit project"><p>You don't have permission to edit this project.</p></Page>

  return (
    <Page tone="sand" title={`Edit: ${p.name}`}>
      <ProjectForm
        defaultValues={{
          ngoId: "",
          name: p.name,
          description: p.description ?? "",
          category: p.category,
          status: p.status,
          startDate: p.start_date ?? "",
          endDate: p.end_date ?? "",
          ...coordinatesToForm(p),
        }}
        submitLabel="Save changes"
        onSubmit={(v) => update.mutate(v)}
        error={update.error}
        pending={update.isPending}
      />
    </Page>
  )
}
