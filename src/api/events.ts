import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Tables } from "@/types/database"

export type EventWithProject = Tables<"events"> & { projects: { id: string; name: string } }

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<EventWithProject[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("*, projects(id, name)")
        .order("date")
      if (error) throw error
      return data
    },
  })
}

export function useProjectEvents(projectId: string) {
  return useQuery({
    queryKey: ["events", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("project_id", projectId)
        .order("date")
      if (error) throw error
      return data
    },
  })
}
