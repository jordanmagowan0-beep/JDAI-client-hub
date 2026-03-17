export type UserRole = 'admin' | 'client';

export interface PortalUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  client_id: string | null;
  client_company_name: string | null;
}

export interface Client {
  id: string;
  company_name: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  slug: string | null;
  status: string;
  summary: string | null;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  total_budget: number;
  spent_budget: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  milestone_date: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectScopeItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: string | null;
  included: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectGoal {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  target_metric: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChangeRequest {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  impact_summary: string | null;
  budget_impact: number;
  timeline_impact_days: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBudgetItem {
  id: string;
  project_id: string;
  label: string;
  amount: number;
  category: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  body: string;
  update_type: string;
  visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}
