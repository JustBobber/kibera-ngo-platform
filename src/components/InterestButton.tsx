import { Link } from "react-router"
import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInterestCounts, useMyInterests, useToggleInterest } from "@/api/interests"
import { useAuth } from "@/lib/auth"
import { errorMessage } from "@/lib/errors"

// Interest is anonymous: only the total count is public.
export function InterestButton({ projectId }: { projectId: string }) {
  const { session } = useAuth()
  const counts = useInterestCounts()
  const mine = useMyInterests()
  const toggle = useToggleInterest()

  const count = counts.data?.get(projectId) ?? 0
  const interested = mine.data?.has(projectId) ?? false

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-1 text-sm">
        <HeartIcon className="size-4 text-pink-600" />
        {count} {count === 1 ? "person is" : "people are"} interested
      </span>
      {session ? (
        <Button
          variant={interested ? "outline" : "default"}
          disabled={toggle.isPending || mine.isPending}
          onClick={() => toggle.mutate({ projectId, interested })}
        >
          {interested ? "Withdraw interest" : "Show interest"}
        </Button>
      ) : (
        <Link to="/login" className="text-sm underline underline-offset-4">Log in to show interest</Link>
      )}
      {toggle.error && <p className="w-full text-sm text-destructive">{errorMessage(toggle.error)}</p>}
      {session && <p className="w-full text-xs text-muted-foreground">Your interest is anonymous. Only the total is shown.</p>}
    </div>
  )
}
