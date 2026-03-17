import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, LoaderCircle } from 'lucide-react';
import { PanelMessage } from '@/components/PortalFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { useClients, useProjectBudgetItems, useProjects } from '@/hooks/useData';
import { formatCurrency } from '@/lib/format';
import { getProjectBudgetRemaining, getProjectBudgetUtilisation } from '@/lib/portal-metrics';

const budgetItemStatusColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  invoiced: 'bg-primary/20 text-primary',
  paid: 'bg-success/20 text-success',
};

const BudgetPage: React.FC = () => {
  const { canManagePortal } = useAuth();
  const projectsQuery = useProjects();
  const clientsQuery = useClients();
  const projectIds = (projectsQuery.data ?? []).map((project) => project.id);
  const budgetItemsQuery = useProjectBudgetItems(projectIds);

  if (projectsQuery.isLoading || budgetItemsQuery.isLoading) {
    return (
      <PanelMessage
        title="Loading budget overview"
        description="Fetching live project budgets and budget items from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (projectsQuery.error || budgetItemsQuery.error) {
    return (
      <PanelMessage
        title="Unable to load budget data"
        description="Budget information could not be retrieved from Supabase."
      />
    );
  }

  const projects = projectsQuery.data ?? [];
  const budgetItems = budgetItemsQuery.data ?? [];
  const clients = clientsQuery.data ?? [];
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const budgetItemsByProject = new Map<string, typeof budgetItems>();

  for (const budgetItem of budgetItems) {
    const existing = budgetItemsByProject.get(budgetItem.project_id) ?? [];
    existing.push(budgetItem);
    budgetItemsByProject.set(budgetItem.project_id, existing);
  }

  const totalBudget = projects.reduce((sum, project) => sum + project.total_budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent_budget, 0);
  const totalRemaining = projects.reduce((sum, project) => sum + getProjectBudgetRemaining(project), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Budget Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Financial summary across all accessible projects</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card text-center">
          <p className="mb-1 text-xs text-muted-foreground">Total Budget</p>
          <p className="font-display text-3xl font-bold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="stat-card text-center">
          <p className="mb-1 text-xs text-muted-foreground">Total Spent</p>
          <p className="font-display text-3xl font-bold text-primary">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card text-center">
          <p className="mb-1 text-xs text-muted-foreground">Remaining</p>
          <p className="font-display text-3xl font-bold text-success">{formatCurrency(totalRemaining)}</p>
        </div>
      </div>

      {projects.map((project) => {
        const client = clientMap.get(project.client_id);
        const remaining = getProjectBudgetRemaining(project);
        const utilisation = getProjectBudgetUtilisation(project);
        const projectBudgetItems = budgetItemsByProject.get(project.id) ?? [];

        return (
          <div key={project.id} className="glass-panel p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <Link to={`/projects/${project.id}`} className="font-display font-semibold transition-colors hover:text-primary">
                  {project.title}
                </Link>
                {canManagePortal && client && <p className="text-xs text-muted-foreground">{client.company_name}</p>}
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>

            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">{formatCurrency(project.total_budget, project.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="font-semibold text-primary">{formatCurrency(project.spent_budget, project.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="font-semibold text-success">{formatCurrency(remaining, project.currency)}</p>
              </div>
            </div>

            <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${utilisation}%` }} />
            </div>

            {projectBudgetItems.length > 0 ? (
              <div className="space-y-2">
                {projectBudgetItems.map((budgetItem) => (
                  <div
                    key={budgetItem.id}
                    className="flex items-center justify-between border-b border-border/30 py-2 text-sm last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`status-badge text-xs ${
                          budgetItemStatusColors[budgetItem.status] || 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {budgetItem.status}
                      </span>
                      <div>
                        <p>{budgetItem.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {budgetItem.category || 'Uncategorised'} · Sort order {budgetItem.sort_order}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(budgetItem.amount, project.currency)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <PanelMessage
                title="No budget items"
                description="Budget line items have not been added for this project yet."
                className="p-6"
              />
            )}
          </div>
        );
      })}

      {projects.length === 0 && (
        <PanelMessage
          title="No budget records available"
          description="Accessible project budgets will appear here once they are available."
        />
      )}
    </div>
  );
};

export default BudgetPage;
