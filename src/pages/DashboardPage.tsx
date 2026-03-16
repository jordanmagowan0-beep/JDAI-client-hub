import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoProjects, demoMilestones, demoBudgets, demoCommunications, demoCompanies, demoChangeRequests } from '@/data/demo-data';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, TrendingUp, AlertCircle, MessageSquare, DollarSign, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  'in-progress': 'bg-primary/20 text-primary',
  'planning': 'bg-warning/20 text-warning',
  'completed': 'bg-success/20 text-success',
  'on-hold': 'bg-muted text-muted-foreground',
  'blocked': 'bg-destructive/20 text-destructive',
};

const healthLabels: Record<string, { label: string; color: string }> = {
  healthy: { label: 'On Track', color: 'text-success' },
  'at-risk': { label: 'At Risk', color: 'text-warning' },
  critical: { label: 'Critical', color: 'text-destructive' },
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const projects = isAdmin
    ? demoProjects
    : demoProjects.filter(p => p.companyId === user?.companyId);

  const companyName = !isAdmin
    ? demoCompanies.find(c => c.id === user?.companyId)?.name
    : 'DMIT Solutions';

  const projectIds = projects.map(p => p.id);
  const activeMilestones = demoMilestones.filter(m => projectIds.includes(m.projectId) && m.status === 'in-progress');
  const nextMilestone = demoMilestones.filter(m => projectIds.includes(m.projectId) && m.status === 'planned').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const recentUpdates = demoCommunications.filter(c => projectIds.includes(c.projectId)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const budgets = demoBudgets.filter(b => projectIds.includes(b.projectId));
  const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const pendingChanges = demoChangeRequests.filter(cr => projectIds.includes(cr.projectId) && cr.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl font-bold">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">{companyName} — Portal Overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Active Projects</span>
          </div>
          <p className="text-3xl font-display font-bold">{projects.filter(p => p.status === 'in-progress').length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">In-Progress Milestones</span>
          </div>
          <p className="text-3xl font-display font-bold">{activeMilestones.length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Pending Changes</span>
          </div>
          <p className="text-3xl font-display font-bold">{pendingChanges.length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Budget Utilised</span>
          </div>
          <p className="text-3xl font-display font-bold">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</p>
        </div>
      </div>

      {/* Projects + Next Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold">Active Projects</h2>
            <Link to="/projects" className="text-primary text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {projects.map(project => {
              const health = healthLabels[project.health];
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="block glass-panel-hover p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{project.title}</h3>
                      {isAdmin && <p className="text-xs text-muted-foreground mt-0.5">{demoCompanies.find(c => c.id === project.companyId)?.name}</p>}
                    </div>
                    <span className={`status-badge ${statusColors[project.status]}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className={health.color}>{health.label}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.endDate}</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Next Milestone */}
          {nextMilestone && (
            <div className="glass-panel p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Next Milestone
              </h2>
              <h3 className="font-medium text-sm mb-1">{nextMilestone.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{nextMilestone.description}</p>
              <p className="text-xs text-primary font-medium">{nextMilestone.dueDate}</p>
            </div>
          )}

          {/* Budget Snapshot */}
          {budgets.length > 0 && (
            <div className="glass-panel p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget Snapshot
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">${totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">${totalSpent.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(totalSpent / totalBudget) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Pending Changes */}
          {pendingChanges.length > 0 && (
            <div className="glass-panel p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Changes
              </h2>
              <div className="space-y-3">
                {pendingChanges.map(cr => (
                  <div key={cr.id} className="text-sm">
                    <p className="font-medium">{cr.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Impact: <span className="capitalize">{cr.impact}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recent Updates
          </h2>
          <Link to="/updates" className="text-primary text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentUpdates.map(update => (
            <div key={update.id} className="border-l-2 border-primary/30 pl-4 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">{update.date}</span>
                <span className="status-badge bg-primary/10 text-primary text-xs">{update.type}</span>
              </div>
              <h3 className="font-medium text-sm">{update.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{update.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FolderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
);

export default DashboardPage;
