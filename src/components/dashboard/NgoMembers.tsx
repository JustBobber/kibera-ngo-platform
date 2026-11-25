import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormError, NativeSelect } from "@/components/FormField"
import { ErrorMessage, Loading } from "@/components/Page"
import { useNgoMembers } from "@/api/ngos"
import { useAuth } from "@/lib/auth"
import { ROLE_LABELS } from "@/lib/labels"
import { supabase } from "@/lib/supabase"
import type { Enums } from "@/types/database"

type Role = Enums<"ngo_member_role">

export function NgoMembers({ ngoId }: { ngoId: string }) {
  const auth = useAuth()
  const members = useNgoMembers(ngoId)
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("member")
  const [notice, setNotice] = useState<string | null>(null)

  const canManage = auth.isNgoAdmin(ngoId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ngo_members", ngoId] })
    queryClient.invalidateQueries({ queryKey: ["memberships"] })
  }

  const add = useMutation({
    mutationFn: async () => {
      // Only platform admins can assign the ngo_admin role (enforced in the database).
      const { data, error } = await supabase.rpc("add_ngo_member", {
        _ngo_id: ngoId,
        _email: email,
        _role: auth.isAdmin ? role : "member",
      })
      if (error) throw error
      return data
    },
    onSuccess: (added) => {
      if (!added) {
        setNotice("No user with that email. They need to sign up first.")
        return
      }
      setNotice(`${email} was added.`)
      setEmail("")
      invalidate()
    },
  })

  const remove = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("ngo_members").delete().eq("ngo_id", ngoId).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return (
    <div className="grid gap-3">
      <h3 className="font-semibold">Members</h3>
      {members.isPending ? (
        <Loading />
      ) : members.error ? (
        <ErrorMessage error={members.error} />
      ) : (
        <ul className="grid gap-2">
          {members.data.map((m) => {
            // ngo_admins can remove plain members; platform admins can remove anyone.
            const canRemove = m.user_id !== auth.userId && (auth.isAdmin || (canManage && m.role === "member"))
            return (
              <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {m.profiles?.name || "(no name)"}
                  {m.user_id === auth.userId && " (you)"}{" "}
                  <Badge variant="secondary">{ROLE_LABELS[m.role]}</Badge>
                </span>
                {canRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={remove.isPending}
                    onClick={() => confirm(`Remove ${m.profiles?.name || "this member"}?`) && remove.mutate(m.user_id)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <FormError error={remove.error} />

      {canManage && (
        <form
          className="grid gap-2 sm:flex"
          onSubmit={(e) => {
            e.preventDefault()
            setNotice(null)
            if (email.trim()) add.mutate()
          }}
        >
          <Input
            type="email"
            placeholder="Email of a registered user"
            aria-label="Email of the user to add"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {auth.isAdmin && (
            <NativeSelect className="sm:w-40" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="member">{ROLE_LABELS.member}</option>
              <option value="ngo_admin">{ROLE_LABELS.ngo_admin}</option>
            </NativeSelect>
          )}
          <Button type="submit" disabled={add.isPending}>Add member</Button>
        </form>
      )}
      {notice && <p className="text-sm">{notice}</p>}
      <FormError error={add.error} />
    </div>
  )
}
