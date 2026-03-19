import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type {
  ChangeRequest,
  Client,
  PortalUser,
  Profile,
  Project,
  ProjectBudgetItem,
  ProjectGoal,
  ProjectMilestone,
  ProjectScopeItem,
  ProjectUpdate,
  UserRole,
} from '@/types/portal';

type RawRow = Record<string, unknown>;

const CLIENT_SELECT =
  'id, company_name, primary_contact_name, primary_contact_email, status, created_at, updated_at';
const PROFILE_SELECT = 'id, full_name, email, role, client_id, created_at, updated_at';
const PROJECT_SELECT =
  'id, client_id, title, slug, status, summary, start_date, target_end_date, actual_end_date, total_budget, spent_budget, currency, created_at, updated_at';
const PROJECT_MILESTONE_SELECT =
  'id, project_id, title, description, milestone_date, status, sort_order, created_at, updated_at';
const PROJECT_SCOPE_ITEM_SELECT =
  'id, project_id, title, description, category, included, sort_order, created_at, updated_at';
const PROJECT_GOAL_SELECT =
  'id, project_id, title, description, target_metric, status, sort_order, created_at, updated_at';
const CHANGE_REQUEST_SELECT =
  'id, project_id, title, description, status, impact_summary, budget_impact, timeline_impact_days, created_at, updated_at';
const PROJECT_BUDGET_ITEM_SELECT =
  'id, project_id, label, amount, category, status, sort_order, created_at, updated_at';
const PROJECT_UPDATE_SELECT =
  'id, project_id, title, body, update_type, visible_to_client, created_at, updated_at';

const asRecord = (value: unknown): RawRow =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as RawRow) : {};

const asRows = (value: unknown): RawRow[] =>
  Array.isArray(value) ? value.map(asRecord) : [];

const asString = (value: unknown) => (typeof value === 'string' ? value : null);

const asRequiredString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asInteger = (value: unknown, fallback = 0) => {
  const parsed = asNumber(value, fallback);
  return Number.isInteger(parsed) ? parsed : Math.trunc(parsed);
};

const asBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return fallback;
};

const asRole = (value: unknown): UserRole => (value === 'admin' ? 'admin' : 'client');

const readAuthMetadataName = (authUser: SupabaseAuthUser) => {
  const metadata =
    typeof authUser.user_metadata === 'object' && authUser.user_metadata !== null
      ? (authUser.user_metadata as Record<string, unknown>)
      : {};

  if (typeof metadata.full_name === 'string' && metadata.full_name.trim().length > 0) {
    return metadata.full_name.trim();
  }

  return authUser.email?.split('@')[0] || authUser.id;
};

const mapClient = (row: RawRow): Client => ({
  id: asRequiredString(row.id),
  company_name: asRequiredString(row.company_name),
  primary_contact_name: asString(row.primary_contact_name),
  primary_contact_email: asString(row.primary_contact_email),
  status: asRequiredString(row.status, 'active'),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProfile = (row: RawRow): Profile => ({
  id: asRequiredString(row.id),
  full_name: asString(row.full_name),
  email: asString(row.email),
  role: asRole(row.role),
  client_id: asString(row.client_id),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProject = (row: RawRow): Project => ({
  id: asRequiredString(row.id),
  client_id: asRequiredString(row.client_id),
  title: asRequiredString(row.title),
  slug: asString(row.slug),
  status: asRequiredString(row.status, 'planning'),
  summary: asString(row.summary),
  start_date: asString(row.start_date),
  target_end_date: asString(row.target_end_date),
  actual_end_date: asString(row.actual_end_date),
  total_budget: asNumber(row.total_budget, 0),
  spent_budget: asNumber(row.spent_budget, 0),
  currency: asRequiredString(row.currency, 'GBP'),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProjectMilestone = (row: RawRow): ProjectMilestone => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  title: asRequiredString(row.title),
  description: asString(row.description),
  milestone_date: asString(row.milestone_date),
  status: asRequiredString(row.status, 'planned'),
  sort_order: asInteger(row.sort_order, 0),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProjectScopeItem = (row: RawRow): ProjectScopeItem => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  title: asRequiredString(row.title),
  description: asString(row.description),
  category: asString(row.category),
  included: asBoolean(row.included, true),
  sort_order: asInteger(row.sort_order, 0),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProjectGoal = (row: RawRow): ProjectGoal => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  title: asRequiredString(row.title),
  description: asString(row.description),
  target_metric: asString(row.target_metric),
  status: asRequiredString(row.status, 'active'),
  sort_order: asInteger(row.sort_order, 0),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapChangeRequest = (row: RawRow): ChangeRequest => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  title: asRequiredString(row.title),
  description: asString(row.description),
  status: asRequiredString(row.status, 'pending'),
  impact_summary: asString(row.impact_summary),
  budget_impact: asNumber(row.budget_impact, 0),
  timeline_impact_days: asInteger(row.timeline_impact_days, 0),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProjectBudgetItem = (row: RawRow): ProjectBudgetItem => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  label: asRequiredString(row.label),
  amount: asNumber(row.amount, 0),
  category: asString(row.category),
  status: asRequiredString(row.status, 'planned'),
  sort_order: asInteger(row.sort_order, 0),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

const mapProjectUpdate = (row: RawRow): ProjectUpdate => ({
  id: asRequiredString(row.id),
  project_id: asRequiredString(row.project_id),
  title: asRequiredString(row.title),
  body: asRequiredString(row.body),
  update_type: asRequiredString(row.update_type, 'general'),
  visible_to_client: asBoolean(row.visible_to_client, true),
  created_at: asRequiredString(row.created_at),
  updated_at: asRequiredString(row.updated_at),
});

export const fetchPortalUser = async (authUser: SupabaseAuthUser): Promise<PortalUser> => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const profile = profileData ? mapProfile(asRecord(profileData)) : null;
  let client_company_name: string | null = null;

  if (profile?.client_id) {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('id', profile.client_id)
      .maybeSingle();

    if (clientError) {
      throw clientError;
    }

    client_company_name = clientData ? asString(asRecord(clientData).company_name) : null;
  }

  return {
    id: authUser.id,
    email: profile?.email || authUser.email || '',
    full_name: profile?.full_name || readAuthMetadataName(authUser),
    role: profile?.role || 'client',
    client_id: profile?.client_id || null,
    client_company_name,
  };
};

export const fetchClients = async () => {
  const { data, error } = await supabase.from('clients').select(CLIENT_SELECT).order('company_name', { ascending: true });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapClient);
};

export interface FetchProjectsOptions {
  limit?: number;
  offset?: number;
}

export const fetchProjects = async (options?: FetchProjectsOptions) => {
  let query = supabase.from('projects').select(PROJECT_SELECT).order('created_at', { ascending: false });

  if (options?.limit !== undefined) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProject);
};

export const fetchProjectById = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProject(asRecord(data)) : null;
};

export const fetchMilestones = async (projectIds: string[]) => {
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from('project_milestones')
    .select(PROJECT_MILESTONE_SELECT)
    .in('project_id', projectIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProjectMilestone);
};

export const fetchProjectScopeItems = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_scope_items')
    .select(PROJECT_SCOPE_ITEM_SELECT)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProjectScopeItem);
};

export const fetchProjectGoals = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_goals')
    .select(PROJECT_GOAL_SELECT)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProjectGoal);
};

export const fetchChangeRequests = async (projectIds: string[]) => {
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from('change_requests')
    .select(CHANGE_REQUEST_SELECT)
    .in('project_id', projectIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapChangeRequest);
};

export const fetchProjectBudgetItems = async (projectIds: string[]) => {
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from('project_budget_items')
    .select(PROJECT_BUDGET_ITEM_SELECT)
    .in('project_id', projectIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProjectBudgetItem);
};

export const fetchProjectUpdates = async (projectIds: string[]) => {
  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from('project_updates')
    .select(PROJECT_UPDATE_SELECT)
    .in('project_id', projectIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return asRows(data).map(mapProjectUpdate);
};
