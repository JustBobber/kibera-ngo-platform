import { Constants, type Enums } from "@/types/database"

export type ProjectCategory = Enums<"project_category">
export type ProjectStatus = Enums<"project_status">

export const CATEGORIES = Constants.public.Enums.project_category
export const STATUSES = Constants.public.Enums.project_status
export const ACTIVE_STATUSES: ProjectStatus[] = ["in_planning", "running"]

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  infrastructure_engineering: "Infrastructure and Engineering",
  health_relief_welfare: "Health, Relief and Welfare",
  education_kids_youth: "Education, Kids and Youth",
  economic_development_empowerment: "Economic Development and Empowerment",
  human_rights_data: "Human Rights and Data",
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  in_planning: "In planning",
  running: "Running",
  done: "Done",
  canceled: "Canceled",
}

export const ROLE_LABELS: Record<Enums<"ngo_member_role">, string> = {
  ngo_admin: "NGO admin",
  member: "Member",
}
