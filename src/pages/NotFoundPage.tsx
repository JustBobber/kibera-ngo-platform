import { Link } from "react-router"
import { Page } from "@/components/Page"

export function NotFoundPage() {
  return (
    <Page title="Page not found">
      <Link to="/" className="underline">Go to the front page</Link>
    </Page>
  )
}
