import { supabase } from '@/integrations/supabase/client';
import type {
  ChangeRequest,
  Project,
  ProjectBudgetItem,
  ProjectGoal,
  ProjectMilestone,
  ProjectScopeItem,
  ProjectUpdate,
} from '@/types/portal';

const trimRequired = (value: string, fieldLabel: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldLabel} is required.`);
  }

  return trimmed;
};

const trimOptional = (value?: string | null) => {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
};

const parseNumeric = (value: number | string, fieldLabel: string) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }

  return parsed;
};

const parseInteger = (value: number | string, fieldLabel: string) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldLabel} must be a valid whole number.`);
  }

  return parsed;
};

const parseDateOrNull = (value?: string | null, fieldLabel?: string) => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(fieldLabel ? `${fieldLabel} must be a valid date.` : 'Invalid date value.');
  }

  return trimmed;
};

const runInsert = async <TPayload extends Record<string, unknown>>(table: string, payload: TPayload) => {
  const { error } = await supabase.from(table).insert(payload);
  if (error) {
    throw error;
  }
};

const runUpdate = async <TPayload extends Record<string, unknown>>(table: string, id: string, payload: TPayload) => {
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) {
    throw error;
  }
};

const runDelete = async (table: string, id: string) => {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    throw error;
  }
};

export type ProjectInsertPayload = Pick<Project, 'client_id' | 'title'> &
  Partial<
    Pick<
      Project,
      'slug' | 'status' | 'summary' | 'start_date' | 'target_end_date' | 'actual_end_date' | 'total_budget' | 'spent_budget' | 'currency'
    >
  >;

export type ProjectUpdatePayload = Partial<
  Pick<
    Project,
    'client_id' | 'title' | 'slug' | 'status' | 'summary' | 'start_date' | 'target_end_date' | 'actual_end_date' | 'total_budget' | 'spent_budget' | 'currency'
  >
>;

export interface ProjectBasicsInput {
  project_id: string;
  title: string;
  status: string;
  summary?: string | null;
  slug?: string | null;
  start_date?: string | null;
  target_end_date?: string | null;
  actual_end_date?: string | null;
  total_budget: number | string;
  spent_budget: number | string;
  currency: string;
}

const buildProjectBasicsPayload = (input: ProjectBasicsInput): ProjectUpdatePayload => ({
  title: trimRequired(input.title, 'Project title'),
  status: trimRequired(input.status, 'Project status'),
  summary: trimOptional(input.summary),
  slug: trimOptional(input.slug),
  start_date: parseDateOrNull(input.start_date, 'Start date'),
  target_end_date: parseDateOrNull(input.target_end_date, 'Target end date'),
  actual_end_date: parseDateOrNull(input.actual_end_date, 'Actual end date'),
  total_budget: parseNumeric(input.total_budget, 'Total budget'),
  spent_budget: parseNumeric(input.spent_budget, 'Spent budget'),
  currency: trimRequired(input.currency, 'Currency'),
});

export const updateProjectBasics = async (input: ProjectBasicsInput) => {
  await runUpdate('projects', input.project_id, buildProjectBasicsPayload(input));
};

export type ProjectMilestoneInsertPayload = Pick<ProjectMilestone, 'project_id' | 'title'> &
  Partial<Pick<ProjectMilestone, 'description' | 'milestone_date' | 'status' | 'sort_order'>>;

export type ProjectMilestoneUpdatePayload = Partial<
  Pick<ProjectMilestone, 'title' | 'description' | 'milestone_date' | 'status' | 'sort_order'>
>;

export interface ProjectMilestoneInput {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  milestone_date?: string | null;
  status: string;
  sort_order: number | string;
}

const buildMilestoneInsertPayload = (input: ProjectMilestoneInput): ProjectMilestoneInsertPayload => ({
  project_id: input.project_id,
  title: trimRequired(input.title, 'Milestone title'),
  description: trimOptional(input.description),
  milestone_date: parseDateOrNull(input.milestone_date, 'Milestone date'),
  status: trimRequired(input.status, 'Milestone status'),
  sort_order: parseInteger(input.sort_order, 'Milestone sort order'),
});

const buildMilestoneUpdatePayload = (input: ProjectMilestoneInput): ProjectMilestoneUpdatePayload => ({
  title: trimRequired(input.title, 'Milestone title'),
  description: trimOptional(input.description),
  milestone_date: parseDateOrNull(input.milestone_date, 'Milestone date'),
  status: trimRequired(input.status, 'Milestone status'),
  sort_order: parseInteger(input.sort_order, 'Milestone sort order'),
});

export const saveMilestone = async (input: ProjectMilestoneInput) => {
  if (input.id) {
    await runUpdate('project_milestones', input.id, buildMilestoneUpdatePayload(input));
    return;
  }

  await runInsert('project_milestones', buildMilestoneInsertPayload(input));
};

export const deleteMilestone = async (milestoneId: string) => {
  await runDelete('project_milestones', milestoneId);
};

export type ProjectScopeItemInsertPayload = Pick<ProjectScopeItem, 'project_id' | 'title'> &
  Partial<Pick<ProjectScopeItem, 'description' | 'category' | 'included' | 'sort_order'>>;

export type ProjectScopeItemUpdatePayload = Partial<
  Pick<ProjectScopeItem, 'title' | 'description' | 'category' | 'included' | 'sort_order'>
>;

export interface ProjectScopeItemInput {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  included: boolean;
  sort_order: number | string;
}

const buildScopeItemInsertPayload = (input: ProjectScopeItemInput): ProjectScopeItemInsertPayload => ({
  project_id: input.project_id,
  title: trimRequired(input.title, 'Scope item title'),
  description: trimOptional(input.description),
  category: trimOptional(input.category),
  included: input.included,
  sort_order: parseInteger(input.sort_order, 'Scope item sort order'),
});

const buildScopeItemUpdatePayload = (input: ProjectScopeItemInput): ProjectScopeItemUpdatePayload => ({
  title: trimRequired(input.title, 'Scope item title'),
  description: trimOptional(input.description),
  category: trimOptional(input.category),
  included: input.included,
  sort_order: parseInteger(input.sort_order, 'Scope item sort order'),
});

export const saveProjectScopeItem = async (input: ProjectScopeItemInput) => {
  if (input.id) {
    await runUpdate('project_scope_items', input.id, buildScopeItemUpdatePayload(input));
    return;
  }

  await runInsert('project_scope_items', buildScopeItemInsertPayload(input));
};

export const deleteProjectScopeItem = async (scopeItemId: string) => {
  await runDelete('project_scope_items', scopeItemId);
};

export type ProjectGoalInsertPayload = Pick<ProjectGoal, 'project_id' | 'title'> &
  Partial<Pick<ProjectGoal, 'description' | 'target_metric' | 'status' | 'sort_order'>>;

export type ProjectGoalUpdatePayload = Partial<
  Pick<ProjectGoal, 'title' | 'description' | 'target_metric' | 'status' | 'sort_order'>
>;

export interface ProjectGoalInput {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  target_metric?: string | null;
  status: string;
  sort_order: number | string;
}

const buildGoalInsertPayload = (input: ProjectGoalInput): ProjectGoalInsertPayload => ({
  project_id: input.project_id,
  title: trimRequired(input.title, 'Goal title'),
  description: trimOptional(input.description),
  target_metric: trimOptional(input.target_metric),
  status: trimRequired(input.status, 'Goal status'),
  sort_order: parseInteger(input.sort_order, 'Goal sort order'),
});

const buildGoalUpdatePayload = (input: ProjectGoalInput): ProjectGoalUpdatePayload => ({
  title: trimRequired(input.title, 'Goal title'),
  description: trimOptional(input.description),
  target_metric: trimOptional(input.target_metric),
  status: trimRequired(input.status, 'Goal status'),
  sort_order: parseInteger(input.sort_order, 'Goal sort order'),
});

export const saveProjectGoal = async (input: ProjectGoalInput) => {
  if (input.id) {
    await runUpdate('project_goals', input.id, buildGoalUpdatePayload(input));
    return;
  }

  await runInsert('project_goals', buildGoalInsertPayload(input));
};

export const deleteProjectGoal = async (goalId: string) => {
  await runDelete('project_goals', goalId);
};

export type ChangeRequestInsertPayload = Pick<ChangeRequest, 'project_id' | 'title'> &
  Partial<Pick<ChangeRequest, 'description' | 'status' | 'impact_summary' | 'budget_impact' | 'timeline_impact_days'>>;

export type ChangeRequestUpdatePayload = Partial<
  Pick<ChangeRequest, 'title' | 'description' | 'status' | 'impact_summary' | 'budget_impact' | 'timeline_impact_days'>
>;

export interface ChangeRequestInput {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: string;
  impact_summary?: string | null;
  budget_impact: number | string;
  timeline_impact_days: number | string;
}

const buildChangeRequestInsertPayload = (input: ChangeRequestInput): ChangeRequestInsertPayload => ({
  project_id: input.project_id,
  title: trimRequired(input.title, 'Change request title'),
  description: trimOptional(input.description),
  status: trimRequired(input.status, 'Change request status'),
  impact_summary: trimOptional(input.impact_summary),
  budget_impact: parseNumeric(input.budget_impact, 'Budget impact'),
  timeline_impact_days: parseInteger(input.timeline_impact_days, 'Timeline impact days'),
});

const buildChangeRequestUpdatePayload = (input: ChangeRequestInput): ChangeRequestUpdatePayload => ({
  title: trimRequired(input.title, 'Change request title'),
  description: trimOptional(input.description),
  status: trimRequired(input.status, 'Change request status'),
  impact_summary: trimOptional(input.impact_summary),
  budget_impact: parseNumeric(input.budget_impact, 'Budget impact'),
  timeline_impact_days: parseInteger(input.timeline_impact_days, 'Timeline impact days'),
});

export const saveChangeRequest = async (input: ChangeRequestInput) => {
  if (input.id) {
    await runUpdate('change_requests', input.id, buildChangeRequestUpdatePayload(input));
    return;
  }

  await runInsert('change_requests', buildChangeRequestInsertPayload(input));
};

export const deleteChangeRequest = async (changeRequestId: string) => {
  await runDelete('change_requests', changeRequestId);
};

export type ProjectBudgetItemInsertPayload = Pick<ProjectBudgetItem, 'project_id' | 'label'> &
  Partial<Pick<ProjectBudgetItem, 'amount' | 'category' | 'status' | 'sort_order'>>;

export type ProjectBudgetItemUpdatePayload = Partial<
  Pick<ProjectBudgetItem, 'label' | 'amount' | 'category' | 'status' | 'sort_order'>
>;

export interface ProjectBudgetItemInput {
  id?: string;
  project_id: string;
  label: string;
  amount: number | string;
  category?: string | null;
  status: string;
  sort_order: number | string;
}

const buildBudgetItemInsertPayload = (input: ProjectBudgetItemInput): ProjectBudgetItemInsertPayload => ({
  project_id: input.project_id,
  label: trimRequired(input.label, 'Budget item label'),
  amount: parseNumeric(input.amount, 'Budget item amount'),
  category: trimOptional(input.category),
  status: trimRequired(input.status, 'Budget item status'),
  sort_order: parseInteger(input.sort_order, 'Budget item sort order'),
});

const buildBudgetItemUpdatePayload = (input: ProjectBudgetItemInput): ProjectBudgetItemUpdatePayload => ({
  label: trimRequired(input.label, 'Budget item label'),
  amount: parseNumeric(input.amount, 'Budget item amount'),
  category: trimOptional(input.category),
  status: trimRequired(input.status, 'Budget item status'),
  sort_order: parseInteger(input.sort_order, 'Budget item sort order'),
});

export const saveBudgetItem = async (input: ProjectBudgetItemInput) => {
  if (input.id) {
    await runUpdate('project_budget_items', input.id, buildBudgetItemUpdatePayload(input));
    return;
  }

  await runInsert('project_budget_items', buildBudgetItemInsertPayload(input));
};

export const deleteBudgetItem = async (budgetItemId: string) => {
  await runDelete('project_budget_items', budgetItemId);
};

export type ProjectUpdateInsertPayload = Pick<ProjectUpdate, 'project_id' | 'title' | 'body'> &
  Partial<Pick<ProjectUpdate, 'update_type' | 'visible_to_client'>>;

export type ProjectUpdatePayload = Partial<Pick<ProjectUpdate, 'title' | 'body' | 'update_type' | 'visible_to_client'>>;

export interface ProjectUpdateInput {
  id?: string;
  project_id: string;
  title: string;
  body: string;
  update_type: string;
  visible_to_client: boolean;
}

const buildProjectUpdateInsertPayload = (input: ProjectUpdateInput): ProjectUpdateInsertPayload => ({
  project_id: input.project_id,
  title: trimRequired(input.title, 'Update title'),
  body: trimRequired(input.body, 'Update body'),
  update_type: trimRequired(input.update_type, 'Update type'),
  visible_to_client: input.visible_to_client,
});

const buildProjectUpdatePayload = (input: ProjectUpdateInput): ProjectUpdatePayload => ({
  title: trimRequired(input.title, 'Update title'),
  body: trimRequired(input.body, 'Update body'),
  update_type: trimRequired(input.update_type, 'Update type'),
  visible_to_client: input.visible_to_client,
});

export const saveProjectUpdate = async (input: ProjectUpdateInput) => {
  if (input.id) {
    await runUpdate('project_updates', input.id, buildProjectUpdatePayload(input));
    return;
  }

  await runInsert('project_updates', buildProjectUpdateInsertPayload(input));
};

export const deleteProjectUpdate = async (updateId: string) => {
  await runDelete('project_updates', updateId);
};
