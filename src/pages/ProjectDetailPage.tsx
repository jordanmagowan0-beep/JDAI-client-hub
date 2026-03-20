import React, { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PanelMessage } from '@/components/PortalFeedback';
import {
  BudgetItemDialog,
  ChangeRequestDialog,
  GoalDialog,
  MilestoneDialog,
  ProjectBasicsDialog,
  ProjectUpdateDialog,
  ScopeItemDialog,
} from '@/components/admin/ManageEntityDialogs';
import { DeliverablesList } from '@/components/project/DeliverablesList';
import { useAuth } from '@/contexts/AuthContext';
import {
  useChangeRequests,
  useClients,
  useMilestones,
  useProject,
  useProjectBudgetItems,
  useProjectGoals,
  useProjectScopeItems,
  useProjectUpdates,
} from '@/hooks/useData';
import { usePortalAdmin } from '@/hooks/usePortalAdmin';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateLabel } from '@/lib/format';
import { getProjectBudgetRemaining, getProjectBudgetUtilisation, getProjectProgress } from '@/lib/portal-metrics';
import type {
  ChangeRequest,
  ProjectBudgetItem,
  ProjectGoal,
  ProjectMilestone,
  ProjectScopeItem,
  ProjectUpdate,
} from '@/types/portal';

const projectStatusColors: Record<string, string> = {
  'in-progress': 'bg-primary/20 text-primary',
  planning: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  'on-hold': 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/20 text-destructive',
};

const milestoneStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-success" />,
  'in-progress': <Clock className="h-5 w-5 text-primary" />,
  planned: <Circle className="h-5 w-5 text-muted-foreground" />,
  blocked: <AlertTriangle className="h-5 w-5 text-destructive" />,
};

const changeStatusColors: Record<string, string> = {
  approved: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  rejected: 'bg-destructive/20 text-destructive',
};

const budgetStatusColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  invoiced: 'bg-primary/20 text-primary',
  paid: 'bg-success/20 text-success',
};

const updateTypeColors: Record<string, string> = {
  general: 'bg-primary/10 text-primary',
  milestone: 'bg-success/20 text-success',
  meeting: 'bg-warning/20 text-warning',
  decision: 'bg-secondary text-secondary-foreground',
};

const iconButtonClassName = 'h-8 w-8';

const renderMilestoneIcon = (status: string) => milestoneStatusIcon[status] ?? <Circle className="h-5 w-5 text-muted-foreground" />;

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, canManagePortal } = useAuth();
  const projectQuery = useProject(id);
  const clientsQuery = useClients();
  const milestonesQuery = useMilestones(id ? [id] : undefined);
  const scopeItemsQuery = useProjectScopeItems(id);
  const goalsQuery = useProjectGoals(id);
  const changeRequestsQuery = useChangeRequests(id ? [id] : undefined);
  const budgetItemsQuery = useProjectBudgetItems(id ? [id] : undefined);
  const updatesQuery = useProjectUpdates(id ? [id] : undefined);
  const admin = usePortalAdmin();

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [milestoneDialog, setMilestoneDialog] = useState<ProjectMilestone | 'create' | null>(null);
  const [scopeItemDialog, setScopeItemDialog] = useState<ProjectScopeItem | 'create' | null>(null);
  const [goalDialog, setGoalDialog] = useState<ProjectGoal | 'create' | null>(null);
  const [changeRequestDialog, setChangeRequestDialog] = useState<ChangeRequest | 'create' | null>(null);
  const [budgetItemDialog, setBudgetItemDialog] = useState<ProjectBudgetItem | 'create' | null>(null);
  const [updateDialog, setUpdateDialog] = useState<ProjectUpdate | 'create' | null>(null);

  const isLoading =
    projectQuery.isLoading ||
    milestonesQuery.isLoading ||
    scopeItemsQuery.isLoading ||
    goalsQuery.isLoading ||
    changeRequestsQuery.isLoading ||
    budgetItemsQuery.isLoading ||
    updatesQuery.isLoading;

  if (isLoading) {
    return (
      <PanelMessage
        title="Loading project details"
        description="Fetching the live project record and related tables from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (
    projectQuery.error ||
    milestonesQuery.error ||
    scopeItemsQuery.error ||
    goalsQuery.error ||
    changeRequestsQuery.error ||
    budgetItemsQuery.error ||
    updatesQuery.error
  ) {
    return (
      <PanelMessage
        title="Unable to load project"
        description="The project detail view could not be loaded from Supabase."
      />
    );
  }

  const project = projectQuery.data;
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const clients = clientsQuery.data ?? [];
  const client = clients.find((candidate) => candidate.id === project.client_id);
  const clientName =
    client?.company_name || (user?.client_id === project.client_id ? user.client_company_name : null) || null;
  const milestones = milestonesQuery.data ?? [];
  const scopeItems = scopeItemsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const changeRequests = changeRequestsQuery.data ?? [];
  const budgetItems = budgetItemsQuery.data ?? [];
  const updates = updatesQuery.data ?? [];
  const visibleUpdates = canManagePortal ? updates : updates.filter((update) => update.visible_to_client);
  const projectProgress = getProjectProgress(project.id, milestones);
  const budgetRemaining = getProjectBudgetRemaining(project);
  const budgetUtilisation = getProjectBudgetUtilisation(project);

  const scopeCategories = [...new Set(scopeItems.map((item) => item.category || 'Uncategorized'))];

  const handleDelete = async (label: string, action: () => Promise<void>) => {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) {
      return;
    }

    await action();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{project.title}</h1>
              <span className={`status-badge ${projectStatusColors[project.status] || 'bg-muted text-muted-foreground'}`}>
                {project.status}
              </span>
            </div>
            {clientName && <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>}
            <p className="mt-4 text-sm text-muted-foreground">
              {project.summary || 'No summary has been added to this project yet.'}
            </p>
          </div>

          {canManagePortal && (
            <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit Project
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
            <p className="mt-2 text-2xl font-display font-semibold">{projectProgress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${projectProgress}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Budget</p>
            <p className="mt-2 text-2xl font-display font-semibold">
              {formatCurrency(project.total_budget, project.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{project.currency}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Spent Budget</p>
            <p className="mt-2 text-2xl font-display font-semibold text-primary">
              {formatCurrency(project.spent_budget, project.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{budgetUtilisation}% utilised</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
            <p className="mt-2 text-2xl font-display font-semibold text-success">
              {formatCurrency(budgetRemaining, project.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {[formatDateLabel(project.start_date), formatDateLabel(project.target_end_date)].filter(Boolean).join(' -> ') ||
                'Dates not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Clock className="h-5 w-5 text-primary" />
            Timeline & Milestones
          </h2>
          {canManagePortal && (
            <Button type="button" variant="outline" onClick={() => setMilestoneDialog('create')}>
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>
          )}
        </div>

        {milestones.length > 0 ? (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex gap-3 sm:gap-4 rounded-xl border border-border/50 bg-background/30 p-4">
                <div className="mt-0.5 shrink-0">{renderMilestoneIcon(milestone.status)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{milestone.title}</h3>
                        <span className={cn(
                          "status-badge scale-90 origin-left",
                          projectStatusColors[milestone.status] || 'bg-muted text-muted-foreground'
                        )}>
                          {milestone.status}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                      )}
                      {formatDateLabel(milestone.milestone_date) && (
                        <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                          {formatDateLabel(milestone.milestone_date)}
                        </p>
                      )}
                    </div>

                    {canManagePortal && (
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => setMilestoneDialog(milestone)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => handleDelete('milestone', () => admin.deleteMilestone(milestone.id))}
                          disabled={admin.isDeletingMilestone}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PanelMessage
            title="No milestones yet"
            description={
              canManagePortal
                ? 'Create the first milestone to start building the timeline.'
                : 'Milestones will appear here once they are added.'
            }
            className="p-8"
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Project Scope
            </h2>
            {canManagePortal && (
              <Button type="button" variant="outline" onClick={() => setScopeItemDialog('create')}>
                <Plus className="h-4 w-4" />
                Add Scope Item
              </Button>
            )}
          </div>

          {scopeItems.length > 0 ? (
            <div className="space-y-4">
              {scopeCategories.map((category) => (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{category}</h3>
                  <div className="space-y-2">
                    {scopeItems
                      .filter((item) => (item.category || 'Uncategorized') === category)
                      .map((item) => (
                        <div key={item.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0 text-sm">
                              <p className={cn(
                                "font-medium",
                                !item.included && "text-muted-foreground line-through"
                              )}>
                                {item.title}
                              </p>
                              {item.description && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>}
                              <p className="mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                {item.included ? 'Included' : 'Excluded'} · Sort order {item.sort_order}
                              </p>
                            </div>

                            {canManagePortal && (
                              <div className="flex items-center gap-1 self-end sm:self-auto">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={cn(iconButtonClassName, "h-7 w-7")}
                                  onClick={() => setScopeItemDialog(item)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={cn(iconButtonClassName, "h-7 w-7")}
                                  onClick={() => handleDelete('scope item', () => admin.deleteScopeItem(item.id))}
                                  disabled={admin.isDeletingScopeItem}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PanelMessage
              title="No scope items yet"
              description={canManagePortal ? 'Add scope items to define what is included.' : 'Scope items will appear here once they are added.'}
              className="p-8"
            />
          )}
        </div>

        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Target className="h-5 w-5 text-primary" />
              Goals
            </h2>
            {canManagePortal && (
              <Button type="button" variant="outline" onClick={() => setGoalDialog('create')}>
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            )}
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{goal.title}</h3>
                        <span className={cn(
                          "status-badge scale-90 origin-left opacity-70",
                          goal.status === 'completed' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                        )}>
                          {goal.status}
                        </span>
                      </div>
                      {goal.description && <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{goal.description}</p>}
                      {goal.target_metric && (
                        <p className="mt-2 text-[10px] sm:text-xs text-primary font-medium uppercase tracking-wider">
                          Target: {goal.target_metric}
                        </p>
                      )}
                    </div>

                    {canManagePortal && (
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => setGoalDialog(goal)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => handleDelete('goal', () => admin.deleteGoal(goal.id))}
                          disabled={admin.isDeletingGoal}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PanelMessage
              title="No goals yet"
              description={canManagePortal ? 'Add goals to track outcomes for this project.' : 'Goals will appear here once they are added.'}
              className="p-8"
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Change Requests
            </h2>
            {canManagePortal && (
              <Button type="button" variant="outline" onClick={() => setChangeRequestDialog('create')}>
                <Plus className="h-4 w-4" />
                Add Change Request
              </Button>
            )}
          </div>

          {changeRequests.length > 0 ? (
            <div className="space-y-3">
              {changeRequests.map((changeRequest) => (
                <div key={changeRequest.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{changeRequest.title}</h3>
                        <span
                          className={cn(
                            "status-badge scale-90 origin-left",
                            changeStatusColors[changeRequest.status] || 'bg-muted text-muted-foreground'
                          )}
                        >
                          {changeRequest.status}
                        </span>
                      </div>
                      {changeRequest.description && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{changeRequest.description}</p>
                      )}
                      {changeRequest.impact_summary && (
                        <p className="mt-2 text-xs text-muted-foreground italic border-l border-primary/20 pl-2">{changeRequest.impact_summary}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Budget: {formatCurrency(changeRequest.budget_impact, project.currency)}</span>
                        <span>Timeline: {changeRequest.timeline_impact_days} days</span>
                        <span>Created: {formatDateLabel(changeRequest.created_at) || 'Unknown'}</span>
                      </div>
                    </div>

                    {canManagePortal && (
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => setChangeRequestDialog(changeRequest)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(iconButtonClassName, "h-7 w-7")}
                          onClick={() => handleDelete('change request', () => admin.deleteChangeRequest(changeRequest.id))}
                          disabled={admin.isDeletingChangeRequest}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PanelMessage
              title="No change requests yet"
              description={
                canManagePortal
                  ? 'Add change requests to track scope or budget adjustments.'
                  : 'Approved or pending change requests will appear here.'
              }
              className="p-8"
            />
          )}
        </div>

        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget Items
            </h2>
            {canManagePortal && (
              <Button type="button" variant="outline" onClick={() => setBudgetItemDialog('create')}>
                <Plus className="h-4 w-4" />
                Add Budget Item
              </Button>
            )}
          </div>

          {budgetItems.length > 0 ? (
            <div className="space-y-3">
              {budgetItems.map((budgetItem) => (
                <div key={budgetItem.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">{budgetItem.label}</h3>
                        <span
                          className={cn(
                            "status-badge scale-90 origin-left",
                            budgetStatusColors[budgetItem.status] || 'bg-muted text-muted-foreground'
                          )}
                        >
                          {budgetItem.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {budgetItem.category || 'Uncategorised'} · Sort order {budgetItem.sort_order}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(budgetItem.amount, project.currency)}
                      </span>
                      {canManagePortal && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(iconButtonClassName, "h-7 w-7")}
                            onClick={() => setBudgetItemDialog(budgetItem)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(iconButtonClassName, "h-7 w-7")}
                            onClick={() => handleDelete('budget item', () => admin.deleteBudgetItem(budgetItem.id))}
                            disabled={admin.isDeletingBudgetItem}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PanelMessage
              title="No budget items yet"
              description={
                canManagePortal
                  ? 'Add budget line items to break down project spend.'
                  : 'Budget line items will appear here once they are added.'
              }
              className="p-8"
            />
          )}
        </div>
      </div>

      <div className="glass-panel p-6">
        <DeliverablesList projectId={project.id} />
      </div>

      <div className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <MessageSquare className="h-5 w-5 text-primary" />
            Project Updates
          </h2>
          {canManagePortal && (
            <Button type="button" variant="outline" onClick={() => setUpdateDialog('create')}>
              <Plus className="h-4 w-4" />
              Add Update
            </Button>
          )}
        </div>

        {visibleUpdates.length > 0 ? (
          <div className="space-y-4">
            {visibleUpdates.map((update) => (
              <div key={update.id} className="rounded-xl border border-border/50 bg-background/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`status-badge ${updateTypeColors[update.update_type] || 'bg-primary/10 text-primary'}`}>
                        {update.update_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateLabel(update.created_at) || 'Unknown date'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {update.visible_to_client ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Client visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Internal only
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-medium">{update.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{update.body}</p>
                  </div>

                  {canManagePortal && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={iconButtonClassName}
                        onClick={() => setUpdateDialog(update)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={iconButtonClassName}
                        onClick={() => handleDelete('project update', () => admin.deleteProjectUpdate(update.id))}
                        disabled={admin.isDeletingProjectUpdate}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <PanelMessage
            title="No updates yet"
            description={
              canManagePortal
                ? 'Post an update to keep the team or client informed.'
                : 'Project updates will appear here once they are published.'
            }
            className="p-8"
          />
        )}
      </div>

      <ProjectBasicsDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        isSubmitting={admin.isSavingProjectBasics}
        project={project}
        onSubmit={admin.saveProjectBasics}
      />

      <MilestoneDialog
        open={!!milestoneDialog}
        onOpenChange={(open) => {
          if (!open) setMilestoneDialog(null);
        }}
        isSubmitting={admin.isSavingMilestone}
        milestone={milestoneDialog && milestoneDialog !== 'create' ? milestoneDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveMilestone}
      />

      <ScopeItemDialog
        open={!!scopeItemDialog}
        onOpenChange={(open) => {
          if (!open) setScopeItemDialog(null);
        }}
        isSubmitting={admin.isSavingScopeItem}
        scopeItem={scopeItemDialog && scopeItemDialog !== 'create' ? scopeItemDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveScopeItem}
      />

      <GoalDialog
        open={!!goalDialog}
        onOpenChange={(open) => {
          if (!open) setGoalDialog(null);
        }}
        isSubmitting={admin.isSavingGoal}
        goal={goalDialog && goalDialog !== 'create' ? goalDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveGoal}
      />

      <ChangeRequestDialog
        open={!!changeRequestDialog}
        onOpenChange={(open) => {
          if (!open) setChangeRequestDialog(null);
        }}
        isSubmitting={admin.isSavingChangeRequest}
        changeRequest={changeRequestDialog && changeRequestDialog !== 'create' ? changeRequestDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveChangeRequest}
      />

      <BudgetItemDialog
        open={!!budgetItemDialog}
        onOpenChange={(open) => {
          if (!open) setBudgetItemDialog(null);
        }}
        isSubmitting={admin.isSavingBudgetItem}
        budgetItem={budgetItemDialog && budgetItemDialog !== 'create' ? budgetItemDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveBudgetItem}
      />

      <ProjectUpdateDialog
        open={!!updateDialog}
        onOpenChange={(open) => {
          if (!open) setUpdateDialog(null);
        }}
        isSubmitting={admin.isSavingProjectUpdate}
        update={updateDialog && updateDialog !== 'create' ? updateDialog : undefined}
        project_id={project.id}
        onSubmit={admin.saveProjectUpdate}
      />
    </div>
  );
};

export default ProjectDetailPage;
