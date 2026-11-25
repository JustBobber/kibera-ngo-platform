import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { errorMessage } from "@/lib/errors"

// Page wrapper. Each section of the site has its own background tone (see design/).
const TONES = {
  green: "bg-emerald-50",
  sand: "bg-stone-100",
  blue: "bg-sky-50",
  plain: "bg-background",
}

export function Page({
  tone = "plain",
  title,
  actions,
  children,
}: {
  tone?: keyof typeof TONES
  title?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <main className={cn("flex-1", TONES[tone])}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {(title || actions) && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {actions}
          </div>
        )}
        {children}
      </div>
    </main>
  )
}

export function Loading() {
  return <p className="text-muted-foreground">Loading…</p>
}

export function ErrorMessage({ error }: { error: unknown }) {
  return <p className="text-destructive">{errorMessage(error)}</p>
}
