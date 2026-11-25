import { Link } from "react-router"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { useNgos } from "@/api/ngos"

export function NgosPage() {
  const ngos = useNgos()

  return (
    <Page title="Organizations">
      {ngos.isPending ? (
        <Loading />
      ) : ngos.error ? (
        <ErrorMessage error={ngos.error} />
      ) : ngos.data.length === 0 ? (
        <p className="text-muted-foreground">No organizations yet.</p>
      ) : (
        <ul className="grid max-w-3xl gap-3">
          {ngos.data.map((ngo) => (
            <li key={ngo.id}>
              <Link
                to={`/organizations/${ngo.id}`}
                className="block rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted"
              >
                <h2 className="font-semibold">{ngo.name}</h2>
                {ngo.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ngo.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
