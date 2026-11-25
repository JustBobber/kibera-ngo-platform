import { Link, useNavigate, useParams } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { FormError } from "@/components/FormField"
import { InterestButton } from "@/components/InterestButton"
import { ItemsMap } from "@/components/map/LazyMaps"
import { MARKER_COLORS } from "@/components/map/mapItems"
import { PartnerManager } from "@/components/project/PartnerManager"
import { ProjectEvents } from "@/components/project/ProjectEvents"
import { leadNgo, partnerNgos, useProject } from "@/api/projects"
import { useAuth } from "@/lib/auth"
import { hasCoordinates } from "@/lib/coordinates"
import { formatDate } from "@/lib/format"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels"
import { supabase } from "@/lib/supabase"

export function ProjectDetailPage() {
  const { id = "" } = useParams()
  const project = useProject(id)
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate("/projects")
    },
  })

  if (project.isPending) return <Page><Loading /></Page>
  if (project.error) return <Page><ErrorMessage error={project.error} /></Page>
  if (!project.data) return <Page title="Project not found"><Link to="/projects" className="underline">Back to projects</Link></Page>

  const p = project.data
  const lead = leadNgo(p)
  const partners = partnerNgos(p)
  // All NGOs on the project can edit it; only the lead NGO's admins manage partners and delete.
  const canEdit = auth.isAdmin || p.project_ngos.some((pn) => auth.canEditNgo(pn.ngos.id))
  const isLeadAdmin = auth.isAdmin || (!!lead && auth.isNgoAdmin(lead.id))

  return (
    <Page>
      <article className="grid gap-6 rounded-xl bg-card ring-1 ring-foreground/10 p-4 md:p-6">
        <header className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{STATUS_LABELS[p.status]}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[p.category]}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          {(p.start_date || p.end_date) && (
            <p className="text-sm text-muted-foreground">
              {formatDate(p.start_date) || "?"} – {formatDate(p.end_date) || "?"}
            </p>
          )}
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/projects/${p.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Edit project
              </Link>
              {isLeadAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => confirm(`Delete the project "${p.name}" and all its events?`) && remove.mutate()}
                >
                  Delete project
                </Button>
              )}
            </div>
          )}
          <FormError error={remove.error} />
        </header>

        {p.description && <p className="whitespace-pre-line">{p.description}</p>}

        <InterestButton projectId={p.id} />

        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">NGOs</h2>
          {lead && (
            <p className="text-sm">
              Lead: <Link to={`/organizations/${lead.id}`} className="font-medium underline">{lead.name}</Link>
            </p>
          )}
          {partners.length > 0 && (
            <p className="text-sm">
              Partners:{" "}
              {partners.map((ngo, i) => (
                <span key={ngo.id}>
                  {i > 0 && ", "}
                  <Link to={`/organizations/${ngo.id}`} className="underline">{ngo.name}</Link>
                </span>
              ))}
            </p>
          )}
          {isLeadAdmin && <PartnerManager project={p} />}
        </section>

        <ProjectEvents projectId={p.id} canEdit={canEdit} />

        {hasCoordinates(p) && (
          <section className="grid gap-2">
            <h2 className="text-lg font-semibold">Location</h2>
            <ItemsMap
              items={[{
                key: p.id,
                latitude: p.latitude,
                longitude: p.longitude,
                title: p.name,
                href: `/projects/${p.id}`,
                color: MARKER_COLORS.project,
              }]}
            />
          </section>
        )}
      </article>
    </Page>
  )
}
