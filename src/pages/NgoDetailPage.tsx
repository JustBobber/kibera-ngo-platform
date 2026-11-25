import { Link, useParams } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { ItemsMap } from "@/components/map/LazyMaps"
import { MARKER_COLORS } from "@/components/map/mapItems"
import { useNgo } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { hasCoordinates } from "@/lib/coordinates"
import { STATUS_LABELS } from "@/lib/labels"

export function NgoDetailPage() {
  const { id = "" } = useParams()
  const ngo = useNgo(id)
  const auth = useAuth()

  if (ngo.isPending) return <Page><Loading /></Page>
  if (ngo.error) return <Page><ErrorMessage error={ngo.error} /></Page>
  if (!ngo.data) {
    return <Page title="Organization not found"><Link to="/organizations" className="underline">Back to organizations</Link></Page>
  }

  const n = ngo.data
  const leadProjects = n.project_ngos.filter((pn) => pn.is_lead).map((pn) => pn.projects)
  const partnerProjects = n.project_ngos.filter((pn) => !pn.is_lead).map((pn) => pn.projects)

  return (
    <Page>
      <article className="grid gap-6 rounded-xl bg-card ring-1 ring-foreground/10 p-4 md:p-6">
        <header className="grid gap-2">
          <h1 className="text-2xl font-bold">{n.name}</h1>
          {auth.canEditNgo(n.id) && (
            <div>
              <Link to={`/organizations/${n.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Edit profile
              </Link>
            </div>
          )}
        </header>

        {n.description && <p className="whitespace-pre-line">{n.description}</p>}

        {(n.contact_email || n.contact_phone || n.website) && (
          <section className="grid gap-1 text-sm">
            <h2 className="text-lg font-semibold">Contact</h2>
            {n.contact_email && <p>Email: <a href={`mailto:${n.contact_email}`} className="underline">{n.contact_email}</a></p>}
            {n.contact_phone && <p>Phone: <a href={`tel:${n.contact_phone}`} className="underline">{n.contact_phone}</a></p>}
            {n.website && (
              <p>
                Website:{" "}
                <a href={n.website.startsWith("http") ? n.website : `https://${n.website}`} target="_blank" rel="noreferrer" className="underline">
                  {n.website}
                </a>
              </p>
            )}
          </section>
        )}

        <ProjectList title="Projects (lead)" projects={leadProjects} />
        <ProjectList title="Partner in" projects={partnerProjects} />

        {hasCoordinates(n) && (
          <section className="grid gap-2">
            <h2 className="text-lg font-semibold">Location</h2>
            <ItemsMap
              items={[{
                key: n.id,
                latitude: n.latitude,
                longitude: n.longitude,
                title: n.name,
                href: `/organizations/${n.id}`,
                color: MARKER_COLORS.ngo,
              }]}
            />
          </section>
        )}
      </article>
    </Page>
  )
}

function ProjectList({ title, projects }: { title: string; projects: { id: string; name: string; status: keyof typeof STATUS_LABELS }[] }) {
  if (projects.length === 0) return null
  return (
    <section className="grid gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="grid gap-1 text-sm">
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`} className="underline">{p.name}</Link>{" "}
            <span className="text-muted-foreground">({STATUS_LABELS[p.status]})</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
