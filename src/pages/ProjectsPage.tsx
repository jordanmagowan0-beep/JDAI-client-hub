import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, LoaderCircle } from 'lucide-react';
import { PanelMessage } from '@/components/PortalFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { useClients, useMilestones, useProjects } from '@/hooks/useData';
import { formatCurrency, formatDateLabel } from '@/lib/format';
import { getProjectBudgetRemaining, getProjectProgress } from '@/lib/portal-metrics';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  'in-progress': 'bg-primary/20 text-primary',
  planning: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  'on-hold': 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/20 text-destructive',
};

const ProjectsPage: React.FC = () => {
  const { canManagePortal } = useAuth();
  const projectsQuery = useProjects();
  const clientsQuery = useClients();
  const projectIds = (projectsQuery.data ?? []).map((project) => project.id);
  const milestonesQuery = useMilestones(projectIds);

  if (projectsQuery.isLoading || milestonesQuery.isLoading) {
    return (
      <PanelMessage
        title="Loading projects"
        description="Fetching live project data from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (projectsQuery.error || milestonesQuery.error) {
    return (
      <PanelMessage
        title="Unable to load projects"
        description="Projects could not be retrieved from Supabase for this account."
      />
    );
  }

  const projects = projectsQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canManagePortal ? 'All accessible client projects' : 'Projects available to your account'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const progress = getProjectProgress(project.id, milestones);
          const client = clientMap.get(project.client_id);
          const remaining = getProjectBudgetRemaining(project);

          return (
            <Link key={project.id} to={`/projects/${project.id}`} className="glass-panel-hover block p-5 sm:p-6">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-base sm:text-lg font-semibold truncate sm:whitespace-normal">{project.title}</h2>
                  {canManagePortal && client && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{client.company_name}</p>
                  )}
                </div>
                <span className={cn(
                  "status-badge self-start sm:self-auto",
                  statusColors[project.status] || 'bg-muted text-muted-foreground'
                )}>
                  {project.status}
                </span>
              </div>

              <p className="mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                {project.summary || 'No summary has been added to this project yet.'}
              </p>

              {(project.start_date || project.target_end_date) && (
                <div className="mb-4 flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {[formatDateLabel(project.start_date), formatDateLabel(project.target_end_date)].filter(Boolean).join(' -> ')}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground mb-4">
                <div className="flex sm:block justify-between items-baseline border-b sm:border-0 border-border/30 pb-1.5 sm:pb-0">
                  <p>Budget</p>
                  <p className="mt-0 sm:mt-1 font-medium text-foreground">{formatCurrency(project.total_budget, project.currency)}</p>
                </div>
                <div className="flex sm:block justify-between items-baseline border-b sm:border-0 border-border/30 pb-1.5 sm:pb-0">
                  <p>Spent</p>
                  <p className="mt-0 sm:mt-1 font-medium text-foreground">{formatCurrency(project.spent_budget, project.currency)}</p>
                </div>
                <div className="flex sm:block justify-between items-baseline">
                  <p>Remaining</p>
                  <p className="mt-0 sm:mt-1 font-medium text-foreground">{formatCurrency(remaining, project.currency)}</p>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{progress}% complete</p>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-primary font-medium">
                  View details <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}

        {projects.length === 0 && (
          <div className="md:col-span-2">
            <PanelMessage
              title="No projects available"
              description="Projects assigned through Supabase will appear here as soon as they are accessible to this user."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
