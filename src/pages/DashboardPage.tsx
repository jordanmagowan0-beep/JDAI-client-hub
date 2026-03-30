import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  FolderKanban,
  LoaderCircle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { PanelMessage } from '@/components/PortalFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useChangeRequests, useClients, useMilestones, useProjectUpdates, useProjects } from '@/hooks/useData';
import { formatCurrency, formatDateLabel } from '@/lib/format';
import { getProjectProgress } from '@/lib/portal-metrics';

const statusColors: Record<string, string> = {
  'in-progress': 'bg-primary/20 text-primary',
  planning: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  'on-hold': 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/20 text-destructive',
};

const DashboardPage: React.FC = () => {
  const { user, canManagePortal } = useAuth();
  const projectsQuery = useProjects();
  const clientsQuery = useClients();
  const projectIds = (projectsQuery.data ?? []).map((project) => project.id);
  const milestonesQuery = useMilestones(projectIds);
  const updatesQuery = useProjectUpdates(projectIds);
  const changeRequestsQuery = useChangeRequests(projectIds);

  const isLoading =
    projectsQuery.isLoading ||
    milestonesQuery.isLoading ||
    updatesQuery.isLoading ||
    changeRequestsQuery.isLoading;

  if (isLoading) {
    return (
      <PanelMessage
        title="Loading dashboard"
        description="Pulling live project, milestone, and update data from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (projectsQuery.error || milestonesQuery.error || updatesQuery.error || changeRequestsQuery.error) {
    return (
      <PanelMessage
        title="Unable to load dashboard"
        description="The dashboard could not be loaded from Supabase. Check the project tables and row-level access policies."
      />
    );
  }

  const projects = projectsQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];
  const updates = (updatesQuery.data ?? []).filter((update) => canManagePortal || update.visible_to_client);
  const changeRequests = changeRequestsQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const upcomingMilestones = [...milestones]
    .filter((milestone) => milestone.milestone_date)
    .sort((left, right) => new Date(left.milestone_date || '').getTime() - new Date(right.milestone_date || '').getTime());
  const nextMilestone = upcomingMilestones[0];
  const recentUpdates = updates.slice(0, 3);
  const totalBudget = projects.reduce((sum, project) => sum + project.total_budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent_budget, 0);
  const budgetUtilisation = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const pendingChanges = changeRequests.filter((request) => request.status === 'pending');
  const companyName = canManagePortal
    ? 'JDAI Solutions'
    : user?.client_company_name || (user?.client_id ? clientMap.get(user.client_id)?.company_name : null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="overflow-hidden">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {companyName ? `${companyName} - Portal Overview` : 'Portal Overview'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Active Projects</span>
          </div>
          <p className="font-display text-3xl font-bold">{projects.filter((project) => project.status === 'in-progress').length}</p>
        </div>

        <div className="stat-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Completed Milestones</span>
          </div>
          <p className="font-display text-3xl font-bold">
            {milestones.filter((milestone) => milestone.status === 'completed').length}
          </p>
        </div>

        <div className="stat-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Pending Changes</span>
          </div>
          <p className="font-display text-3xl font-bold">{pendingChanges.length}</p>
        </div>

        <div className="stat-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Budget Utilised</span>
          </div>
          <p className="font-display text-3xl font-bold">{budgetUtilisation}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Projects</h2>
            <Link to="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {projects.map((project) => {
              const progress = getProjectProgress(project.id, milestones);
              const clientNameForProject = clientMap.get(project.client_id)?.company_name;

              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="glass-panel-hover block p-4">
                  <div className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate sm:whitespace-normal">{project.title}</h3>
                      {canManagePortal && clientNameForProject && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">{clientNameForProject}</p>
                      )}
                    </div>
                    <span className={cn(
                      "status-badge self-start sm:self-auto",
                      statusColors[project.status] || 'bg-muted text-muted-foreground'
                    )}>
                      {project.status}
                    </span>
                  </div>

                  {(project.start_date || project.target_end_date) && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {[formatDateLabel(project.start_date), formatDateLabel(project.target_end_date)].filter(Boolean).join(' -> ')}
                    </div>
                  )}

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{progress}% complete</p>
                </Link>
              );
            })}

            {projects.length === 0 && (
              <PanelMessage
                title="No projects yet"
                description="Projects assigned to this account will appear here once they are available in Supabase."
                className="p-8"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {nextMilestone ? (
            <div className="glass-panel p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Next Milestone
              </h2>
              <h3 className="text-sm font-medium">{nextMilestone.title}</h3>
              {nextMilestone.description && (
                <p className="mt-1 text-xs text-muted-foreground">{nextMilestone.description}</p>
              )}
              {formatDateLabel(nextMilestone.milestone_date) && (
                <p className="mt-2 text-xs font-medium text-primary">
                  {formatDateLabel(nextMilestone.milestone_date)}
                </p>
              )}
            </div>
          ) : (
            <PanelMessage
              title="No upcoming milestones"
              description="Planned milestones will show here when project timelines are added in Supabase."
              className="p-6"
            />
          )}

          <div className="glass-panel p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget Snapshot
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${budgetUtilisation}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Updates
            </h2>
            {recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="border-l-2 border-primary/30 pl-4">
                    <p className="text-xs text-muted-foreground">
                      {formatDateLabel(update.created_at) || 'Unknown date'}
                    </p>
                    <p className="mt-1 text-sm font-medium">{update.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{update.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <PanelMessage
                title="No recent updates"
                description="Project updates will appear here once they are published."
                className="p-6"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
