import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/FormField"
import { Page } from "@/components/Page"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })
  const { errors, isSubmitting } = form.formState

  if (session) return <Navigate to="/" replace />

  async function onSubmit(values: FormValues) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setError(
        error.code === "email_not_confirmed"
          ? "Your email is not confirmed yet. Check your inbox for the confirmation link."
          : error.message,
      )
      return
    }
    navigate("/")
  }

  return (
    <Page title="Log in">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-sm gap-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>Log in</Button>
        <p className="text-sm">
          No account? <Link to="/signup" className="underline">Sign up</Link>
        </p>
      </form>
    </Page>
  )
}
