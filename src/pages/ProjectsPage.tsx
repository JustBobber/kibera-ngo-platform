import { useState } from "react"
import { ProjectCard } from "@/components/ProjectCard"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { useProjects } from "@/api/projects"
import { useInterestCounts } from "@/api/interests"
import { ACTIVE_STATUSES, CATEGORIES, CATEGORY_LABELS } from "@/lib/labels"

export function ProjectsPage() {
  const projects = useProjects()
  const counts = useInterestCounts()
  const [showAll, setShowAll] = useState(false)

  const shown = (projects.data ?? []).filter((p) => showAll || ACTIVE_STATUSES.includes(p.status))

  return (
    <Page
      tone="sand"
      title={showAll ? "All projects" : "Active projects overview"}
      actions={
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Include done and canceled
        </label>
      }
    >
      {projects.isPending ? (
        <Loading />
      ) : projects.error ? (
        <ErrorMessage error={projects.error} />
      ) : (
        // One column per category, as in the design. Stacks on small screens.
        <div className="grid gap-4 rounded-2xl bg-stone-200/60 p-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const inCategory = shown.filter((p) => p.category === category)
            return (
              <section key={category} className="rounded-xl bg-green-200 p-3">
                <h2 className="mb-3 text-center font-semibold">{CATEGORY_LABELS[category]}</h2>
                {inCategory.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No projects yet.</p>
                ) : (
                  <ul className="grid gap-3">
                    {inCategory.map((project) => (
                      <li key={project.id}>
                        <ProjectCard project={project} interestCount={counts.data?.get(project.id) ?? 0} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </Page>
  )
}
