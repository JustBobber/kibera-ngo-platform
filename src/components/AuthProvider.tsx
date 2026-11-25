import { useEffect, useState, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { AuthContext, type AuthState, type Membership } from "@/lib/auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      // Permissions depend on who is logged in, so refetch everything.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") queryClient.invalidateQueries()
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const userId = session?.user.id ?? null

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).single()
      if (error) throw error
      return data
    },
  })

  const membershipsQuery = useQuery({
    queryKey: ["memberships", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await supabase
        .from("ngo_members")
        .select("ngo_id, role, ngos(name)")
        .eq("user_id", userId!)
      if (error) throw error
      return data.map((m) => ({ ngo_id: m.ngo_id, role: m.role, ngo_name: m.ngos.name }))
    },
  })

  const profile = profileQuery.data ?? null
  const memberships = membershipsQuery.data ?? []
  const isAdmin = profile?.role === "admin"

  const value: AuthState = {
    session,
    userId,
    profile,
    memberships,
    loading: sessionLoading || (!!userId && (profileQuery.isPending || membershipsQuery.isPending)),
    isAdmin,
    canEditNgo: (ngoId) => isAdmin || memberships.some((m) => m.ngo_id === ngoId),
    isNgoAdmin: (ngoId) => isAdmin || memberships.some((m) => m.ngo_id === ngoId && m.role === "ngo_admin"),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
