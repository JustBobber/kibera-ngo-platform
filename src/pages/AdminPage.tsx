import { useState } from "react"
import { Link, Navigate } from "react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormError } from "@/components/FormField"
import { ErrorMessage, Loading, Page } from "@/components/Page"
import { NgoForm } from "@/components/forms/NgoForm"
import { useNgos } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Enums, TablesInsert } from "@/types/database"

export function AdminPage() {
  const auth = useAuth()

  if (auth.loading) return <Page><Loading /></Page>
  if (!auth.isAdmin) return <Navigate to="/" replace />

  return (
    <Page title="Platform admin">
      <div className="grid gap-6">
        <CreateNgo />
        <NgoList />
        <PlatformAdmins />
      </div>
    </Page>
  )
}

function CreateNgo() {
  const queryClient = useQueryClient()
  // Changing the key resets the form after a successful create.
  const [formKey, setFormKey] = useState(0)
  const [created, setCreated] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: async (row: TablesInsert<"ngos">) => {
      const { error } = await supabase.from("ngos").insert(row)
      if (error) throw error
      return row.name
    },
    onSuccess: (name) => {
      queryClient.invalidateQueries({ queryKey: ["ngos"] })
      setCreated(name)
      setFormKey((k) => k + 1)
    },
  })

  return (
    <Card>
      <CardHeader><CardTitle>Create NGO</CardTitle></CardHeader>
      <CardContent className="grid gap-2">
        {created && (
          <p className="text-sm">
            {created} was created. Add its first NGO admin on the <Link to="/dashboard" className="underline">dashboard</Link>.
          </p>
        )}
        <NgoForm
          key={formKey}
          submitLabel="Create NGO"
          onSubmit={(row) => {
            setCreated(null)
            create.mutate(row)
          }}
          error={create.error}
          pending={create.isPending}
        />
      </CardContent>
    </Card>
  )
}

function NgoList() {
  const ngos = useNgos()
  const queryClient = useQueryClient()

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ngos").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries(),
  })

  return (
    <Card>
      <CardHeader><CardTitle>NGOs</CardTitle></CardHeader>
      <CardContent className="grid gap-2">
        {ngos.isPending ? (
          <Loading />
        ) : ngos.error ? (
          <ErrorMessage error={ngos.error} />
        ) : ngos.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No NGOs yet.</p>
        ) : (
          <ul className="grid gap-2">
            {ngos.data.map((ngo) => (
              <li key={ngo.id} className="flex items-center justify-between gap-2 text-sm">
                <Link to={`/organizations/${ngo.id}`} className="underline">{ngo.name}</Link>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={remove.isPending}
                  onClick={() =>
                    confirm(`Delete ${ngo.name}? Its memberships and project links are deleted too. Projects stay.`) &&
                    remove.mutate(ngo.id)
                  }
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
        <FormError error={remove.error} />
      </CardContent>
    </Card>
  )
}

function PlatformAdmins() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, name").eq("role", "admin").order("name")
      if (error) throw error
      return data
    },
  })

  const setRole = useMutation({
    mutationFn: async (role: Enums<"user_role">) => {
      const { data, error } = await supabase.rpc("set_user_role", { _email: email, _role: role })
      if (error) throw error
      return { found: data, role }
    },
    onSuccess: ({ found, role }) => {
      if (!found) {
        setNotice("No user with that email. They need to sign up first.")
        return
      }
      setNotice(role === "admin" ? `${email} is now a platform admin.` : `${email} is no longer a platform admin.`)
      setEmail("")
      queryClient.invalidateQueries({ queryKey: ["admins"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  return (
    <Card>
      <CardHeader><CardTitle>Platform admins</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        {admins.isPending ? (
          <Loading />
        ) : admins.error ? (
          <ErrorMessage error={admins.error} />
        ) : (
          <ul className="grid gap-1 text-sm">
            {admins.data.map((a) => (
              <li key={a.id}>{a.name || "(no name)"}{a.id === auth.userId && " (you)"}</li>
            ))}
          </ul>
        )}
        <form
          className="grid gap-2 sm:flex"
          onSubmit={(e) => {
            e.preventDefault()
            setNotice(null)
            if (email.trim()) setRole.mutate("admin")
          }}
        >
          <Input
            type="email"
            placeholder="Email of a registered user"
            aria-label="Email of the user"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={setRole.isPending}>Make admin</Button>
          <Button
            type="button"
            variant="outline"
            disabled={setRole.isPending}
            onClick={() => {
              setNotice(null)
              if (email.trim() && confirm(`Remove platform admin rights from ${email}?`)) setRole.mutate("user")
            }}
          >
            Remove admin
          </Button>
        </form>
        {notice && <p className="text-sm">{notice}</p>}
        <FormError error={setRole.error} />
      </CardContent>
    </Card>
  )
}
