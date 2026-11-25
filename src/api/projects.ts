import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Tables } from "@/types/database"

const PROJECT_SELECT = "*, project_ngos(is_lead, ngos(id, name))"

export type ProjectNgo = { is_lead: boolean; ngos: { id: string; name: string } }
export type ProjectWithNgos = Tables<"projects"> & { project_ngos: ProjectNgo[] }

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectWithNgos[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select(PROJECT_SELECT)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async (): Promise<ProjectWithNgos | null> => {
      const { data, error } = await supabase.from("projects").select(PROJECT_SELECT).eq("id", id).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function leadNgo(project: ProjectWithNgos) {
  return project.project_ngos.find((pn) => pn.is_lead)?.ngos ?? null
}

export function partnerNgos(project: ProjectWithNgos) {
  return project.project_ngos.filter((pn) => !pn.is_lead).map((pn) => pn.ngos)
}

/** Lead NGO first, then partners. */
export function projectNgoNames(project: ProjectWithNgos): string {
  return [...project.project_ngos]
    .sort((a, b) => Number(b.is_lead) - Number(a.is_lead))
    .map((pn) => pn.ngos.name)
    .join(", ")
}
