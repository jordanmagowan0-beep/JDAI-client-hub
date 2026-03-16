import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoBudgets, demoProjects, demoCompanies } from '@/data/demo-data';
import { DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const projectIds = isAdmin
    ? demoProjects.map(p => p.id)
    : demoProjects.filter(p => p.companyId === user?.companyId).map(p => p.id);

  const budgets = demoBudgets.filter(b => projectIds.includes(b.projectId));
  const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = budgets.reduce((s, b) => s + b.remaining, 0);

  const stageColors: Record<string, string> = {
    paid: 'bg-success/20 text-success',
    invoiced: 'bg-primary/20 text-primary',
    upcoming: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Budget Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Financial summary across all projects</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="text-3xl font-display font-bold">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className="text-3xl font-display font-bold text-primary">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className="text-3xl font-display font-bold text-success">${totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Per project */}
      {budgets.map(budget => {
        const project = demoProjects.find(p => p.id === budget.projectId);
        const company = project ? demoCompanies.find(c => c.id === project.companyId) : null;
        return (
          <div key={budget.id} className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link to={`/projects/${budget.projectId}`} className="font-display font-semibold hover:text-primary transition-colors">
                  {project?.title}
                </Link>
                {isAdmin && company && <p className="text-xs text-muted-foreground">{company.name}</p>}
              </div>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">${budget.totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="font-semibold text-primary">${budget.spent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="font-semibold text-success">${budget.remaining.toLocaleString()}</p>
              </div>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full" style={{ width: `${(budget.spent / budget.totalBudget) * 100}%` }} />
            </div>

            <div className="space-y-2">
              {budget.stages.map(stage => (
                <div key={stage.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`status-badge text-xs ${stageColors[stage.status]}`}>{stage.status}</span>
                    <span>{stage.name}</span>
                  </div>
                  <span className="font-medium">${stage.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {budgets.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">No budget records available for your projects.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
