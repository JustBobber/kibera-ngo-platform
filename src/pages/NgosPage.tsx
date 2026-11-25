import { Link } from "react-router"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { useNgos } from "@/api/ngos"

export function NgosPage() {
  const ngos = useNgos()

  return (
    <Page tone="blue">
      <section className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <h1 className="mb-4 text-center text-2xl font-bold">Organizations</h1>
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
                  className="block rounded-xl border border-pink-200 bg-pink-50 p-4 transition-colors hover:bg-pink-100"
                >
                  <h2 className="font-semibold">{ngo.name}</h2>
                  {ngo.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ngo.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  )
}
