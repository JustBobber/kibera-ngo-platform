import { createContext, useContext } from "react"
import type { Session } from "@supabase/supabase-js"
import type { Enums, Tables } from "@/types/database"

export type Membership = {
  ngo_id: string
  ngo_name: string
  role: Enums<"ngo_member_role">
}

export type AuthState = {
  session: Session | null
  userId: string | null
  profile: Tables<"profiles"> | null
  memberships: Membership[]
  loading: boolean
  isAdmin: boolean
  /** Member (any role) of this NGO, or platform admin. */
  canEditNgo: (ngoId: string) => boolean
  /** ngo_admin of this NGO, or platform admin. */
  isNgoAdmin: (ngoId: string) => boolean
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>")
  return auth
}
