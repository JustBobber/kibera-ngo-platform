import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env and fill it in.",
  )
}

// The one shared, typed Supabase client. Only the publishable key is used here.
export const supabase = createClient<Database>(url, key)
