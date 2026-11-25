import type { ComponentProps, ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { errorMessage } from "@/lib/errors"

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// A native <select>, styled like the Input component. Light and works well on mobile.
export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-background px-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export function FormError({ error }: { error: unknown }) {
  if (!error) return null
  return <p className="text-sm text-destructive">{errorMessage(error)}</p>
}
