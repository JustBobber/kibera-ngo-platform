import { Link } from "react-router"
import { HeartIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { projectNgoNames, type ProjectWithNgos } from "@/api/projects"
import { STATUS_LABELS } from "@/lib/labels"

export function ProjectCard({ project, interestCount }: { project: ProjectWithNgos; interestCount: number }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-orange-200 bg-orange-100 p-3 text-sm transition-colors hover:bg-orange-200"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{project.name}</h3>
        <Badge variant="outline" className="bg-white/60">{STATUS_LABELS[project.status]}</Badge>
      </div>
      {project.description && <p className="mt-1 line-clamp-2 text-muted-foreground">{project.description}</p>}
      <p className="mt-2 text-xs">
        <span className="font-medium">NGOs:</span> {projectNgoNames(project) || "–"}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <HeartIcon className="size-3" /> {interestCount} interested
      </p>
    </Link>
  )
}
