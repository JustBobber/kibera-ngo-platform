import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Tables } from "@/types/database"

export function useNgos() {
  return useQuery({
    queryKey: ["ngos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ngos").select("*").order("name")
      if (error) throw error
      return data
    },
  })
}

export type NgoWithProjects = Tables<"ngos"> & {
  project_ngos: { is_lead: boolean; projects: Tables<"projects"> }[]
}

export function useNgo(id: string) {
  return useQuery({
    queryKey: ["ngos", id],
    queryFn: async (): Promise<NgoWithProjects | null> => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*, project_ngos(is_lead, projects(*))")
        .eq("id", id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

// Only visible to members of the NGO and platform admins (RLS).
export function useNgoMembers(ngoId: string) {
  return useQuery({
    queryKey: ["ngo_members", ngoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngo_members")
        .select("user_id, role, profiles(name)")
        .eq("ngo_id", ngoId)
      if (error) throw error
      return data
    },
  })
}
