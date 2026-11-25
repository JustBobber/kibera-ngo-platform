import type { ReactNode } from "react"
import { errorMessage } from "@/lib/errors"

export function Page({
  title,
  actions,
  children,
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="flex-1 bg-background">
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
