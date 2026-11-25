import { Link, Navigate } from "react-router"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { NgoDashboardCard } from "@/components/dashboard/NgoDashboardCard"
import { useNgos } from "@/api/ngos"
import { useAuth } from "@/lib/auth"

export function DashboardPage() {
  const auth = useAuth()
  const ngos = useNgos()

  if (auth.loading) return <Page><Loading /></Page>
  if (!auth.session) return <Navigate to="/login" replace />

  // Platform admins see every NGO; everyone else sees the NGOs they belong to.
  return (
    <Page title="NGO dashboard">
      {auth.isAdmin ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            As platform admin you see all NGOs. Create NGOs and manage admins on the <Link to="/admin" className="underline">admin page</Link>.
          </p>
          {ngos.isPending ? (
            <Loading />
          ) : ngos.error ? (
            <ErrorMessage error={ngos.error} />
          ) : (
            <div className="grid gap-4">
              {ngos.data.map((ngo) => {
                const membership = auth.memberships.find((m) => m.ngo_id === ngo.id)
                return <NgoDashboardCard key={ngo.id} ngoId={ngo.id} ngoName={ngo.name} myRole={membership?.role} />
              })}
            </div>
          )}
        </>
      ) : auth.memberships.length === 0 ? (
        <p>You are not a member of any NGO yet. Ask an NGO admin to add you, using the email you signed up with.</p>
      ) : (
        <div className="grid gap-4">
          {auth.memberships.map((m) => (
            <NgoDashboardCard key={m.ngo_id} ngoId={m.ngo_id} ngoName={m.ngo_name} myRole={m.role} />
          ))}
        </div>
      )}
    </Page>
  )
}
