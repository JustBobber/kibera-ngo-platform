import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

// Interest is anonymous: we only ever read the total counts (via an RPC)
// and the current user's own rows. Never other users' user_ids.

export function useInterestCounts() {
  return useQuery({
    queryKey: ["interest_counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_interest_counts")
      if (error) throw error
      return new Map(data.map((row) => [row.project_id, Number(row.interest_count)]))
    },
  })
}

export function useMyInterests() {
  const { userId } = useAuth()
  return useQuery({
    queryKey: ["my_interests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_interests")
        .select("project_id")
        .eq("user_id", userId!)
      if (error) throw error
      return new Set(data.map((row) => row.project_id))
    },
  })
}

export function useToggleInterest() {
  const queryClient = useQueryClient()
  const { userId } = useAuth()
  return useMutation({
    mutationFn: async ({ projectId, interested }: { projectId: string; interested: boolean }) => {
      const { error } = interested
        ? await supabase.from("project_interests").delete().eq("project_id", projectId).eq("user_id", userId!)
        : await supabase.from("project_interests").insert({ project_id: projectId })
      if (error) throw error
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["interest_counts"] })
      queryClient.invalidateQueries({ queryKey: ["my_interests"] })
    },
  })
}
