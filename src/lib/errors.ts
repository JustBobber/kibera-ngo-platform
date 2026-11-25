// Supabase errors are plain objects with a `message`, not always Error instances.
export function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }
  return "Something went wrong."
}
