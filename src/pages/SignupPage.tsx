import { useState } from "react"
import { Link, Navigate } from "react-router"
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
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const { session } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } })
  const { errors, isSubmitting } = form.formState

  if (session) return <Navigate to="/" replace />

  async function onSubmit({ name, email, password }: FormValues) {
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // The name is copied into profiles by the on_auth_user_created trigger.
      options: { data: { name }, emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      return
    }
    setSentTo(email)
  }

  if (sentTo) {
    return (
      <Page title="Check your email">
        <p className="max-w-md">
          We sent a confirmation link to <strong>{sentTo}</strong>. Click the link to confirm your account, then{" "}
          <Link to="/login" className="underline">log in</Link>.
        </p>
      </Page>
    )
  }

  return (
    <Page title="Sign up">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-sm gap-4">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...form.register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>Sign up</Button>
        <p className="text-sm">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </p>
      </form>
    </Page>
  )
}
