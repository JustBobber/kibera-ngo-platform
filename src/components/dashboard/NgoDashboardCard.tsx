import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/Page"
import { NgoMembers } from "@/components/dashboard/NgoMembers"
import { useNgo } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/labels"
import type { Enums } from "@/types/database"

export function NgoDashboardCard({
  ngoId,
  ngoName,
  myRole,
}: {
  ngoId: string
  ngoName: string
  myRole?: Enums<"ngo_member_role">
}) {
  const auth = useAuth()
  const ngo = useNgo(ngoId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          {ngoName}
          {myRole && <Badge variant="secondary">{ROLE_LABELS[myRole]}</Badge>}
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Link to={`/organizations/${ngoId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>View page</Link>
          <Link to={`/organizations/${ngoId}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>Edit profile</Link>
          {auth.isNgoAdmin(ngoId) && (
            <Link to={`/projects/new?ngo=${ngoId}`} className={buttonVariants({ size: "sm" })}>Create project</Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <h3 className="font-semibold">Projects</h3>
          {ngo.isPending ? (
            <Loading />
          ) : !ngo.data || ngo.data.project_ngos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <ul className="grid gap-1 text-sm">
              {ngo.data.project_ngos.map((pn) => (
                <li key={pn.projects.id}>
                  <Link to={`/projects/${pn.projects.id}`} className="underline">{pn.projects.name}</Link>{" "}
                  <span className="text-muted-foreground">
                    ({pn.is_lead ? "lead" : "partner"}, {STATUS_LABELS[pn.projects.status]})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <NgoMembers ngoId={ngoId} />
      </CardContent>
    </Card>
  )
}
