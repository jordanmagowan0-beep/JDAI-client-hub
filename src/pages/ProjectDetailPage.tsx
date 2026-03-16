import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { demoProjects, demoMilestones, demoScopeItems, demoGoals, demoChangeRequests, demoBudgets, demoCommunications, demoCompanies } from '@/data/demo-data';
import { Calendar, CheckCircle, Circle, Clock, AlertTriangle, DollarSign, Target, FileText, MessageSquare, ArrowUpDown } from 'lucide-react';

const milestoneStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-5 h-5 text-success" />,
  'in-progress': <Clock className="w-5 h-5 text-primary" />,
  planned: <Circle className="w-5 h-5 text-muted-foreground" />,
  blocked: <AlertTriangle className="w-5 h-5 text-destructive" />,
};

const changeStatusColors: Record<string, string> = {
  approved: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  rejected: 'bg-destructive/20 text-destructive',
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const project = demoProjects.find(p => p.id === id);

  if (!project) return <Navigate to="/projects" replace />;
  if (user?.role === 'client' && project.companyId !== user.companyId) return <Navigate to="/dashboard" replace />;

  const company = demoCompanies.find(c => c.id === project.companyId);
  const milestones = demoMilestones.filter(m => m.projectId === id).sort((a, b) => a.order - b.order);
  const scopeItems = demoScopeItems.filter(s => s.projectId === id);
  const goals = demoGoals.filter(g => g.projectId === id);
  const changes = demoChangeRequests.filter(cr => cr.projectId === id);
  const budget = demoBudgets.find(b => b.projectId === id);
  const comms = demoCommunications.filter(c => c.projectId === id).sort((a, b) => b.date.localeCompare(a.date));

  const scopeCategories = [...new Set(scopeItems.map(s => s.category))];

  const statusColors: Record<string, string> = {
    'in-progress': 'bg-primary/20 text-primary',
    'planning': 'bg-warning/20 text-warning',
    'completed': 'bg-success/20 text-success',
    'on-hold': 'bg-muted text-muted-foreground',
    'blocked': 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">{project.title}</h1>
            {company && <p className="text-muted-foreground text-sm mt-1">{company.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`status-badge ${statusColors[project.status]}`}>
              {project.status.replace('-', ' ')}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">{project.description}</p>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{project.progress}% complete</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.startDate} → {project.endDate}</span>
        </div>
      </div>

      {/* Timeline / Milestones */}
      <div className="glass-panel p-6">
        <h2 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Timeline & Milestones
        </h2>
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
          <div className="space-y-6">
            {milestones.map((ms, i) => (
              <div key={ms.id} className="relative flex gap-4 pl-0">
                <div className="relative z-10 shrink-0 mt-0.5">{milestoneStatusIcon[ms.status]}</div>
                <div className="flex-1 glass-panel p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{ms.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{ms.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">{ms.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scope */}
        {scopeItems.length > 0 && (
          <div className="glass-panel p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Project Scope
            </h2>
            <div className="space-y-4">
              {scopeCategories.map(cat => (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{cat}</h3>
                  <div className="space-y-2">
                    {scopeItems.filter(s => s.category === cat).map(item => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.included ? 'text-success' : 'text-muted-foreground'}`} />
                        <div>
                          <p className={`font-medium ${!item.included ? 'text-muted-foreground line-through' : ''}`}>{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <div className="glass-panel p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Goals & Outcomes
            </h2>
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="glass-panel p-4">
                  <div className="flex items-start gap-2">
                    <span className={`status-badge text-xs ${goal.type === 'measurable' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                      {goal.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mt-2">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                  {goal.metric && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">{goal.metric}:</span>{' '}
                      <span className="text-primary font-medium">{goal.target}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change Management */}
      {changes.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-primary" />
            Change Management
          </h2>
          <div className="space-y-3">
            {changes.map(cr => (
              <div key={cr.id} className="glass-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`status-badge text-xs ${changeStatusColors[cr.status]}`}>{cr.status}</span>
                      <span className="text-xs text-muted-foreground">Impact: {cr.impact}</span>
                    </div>
                    <h3 className="font-medium text-sm">{cr.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cr.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{cr.submittedDate}</span>
                </div>
                {(cr.budgetImpact || cr.timelineImpact) && (
                  <div className="flex gap-4 mt-3 text-xs">
                    {cr.budgetImpact && <span className="text-muted-foreground">Budget: <span className="text-warning">+${cr.budgetImpact.toLocaleString()}</span></span>}
                    {cr.timelineImpact && <span className="text-muted-foreground">Timeline: <span className="text-warning">{cr.timelineImpact}</span></span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      {budget && (
        <div className="glass-panel p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Budget Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass-panel p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
              <p className="text-2xl font-display font-bold">${budget.totalBudget.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Spent</p>
              <p className="text-2xl font-display font-bold text-primary">${budget.spent.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <p className="text-2xl font-display font-bold text-success">${budget.remaining.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(budget.spent / budget.totalBudget) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {budget.stages.map(stage => {
              const stageColors: Record<string, string> = {
                paid: 'bg-success/20 text-success',
                invoiced: 'bg-primary/20 text-primary',
                upcoming: 'bg-muted text-muted-foreground',
              };
              return (
                <div key={stage.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`status-badge text-xs ${stageColors[stage.status]}`}>{stage.status}</span>
                    <span>{stage.name}</span>
                  </div>
                  <span className="font-medium">${stage.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Communication */}
      {comms.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Communication Log
          </h2>
          <div className="space-y-4">
            {comms.map(update => (
              <div key={update.id} className="border-l-2 border-primary/30 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                  <span className="status-badge bg-primary/10 text-primary text-xs">{update.type}</span>
                  <span className="text-xs text-muted-foreground">by {update.author}</span>
                </div>
                <h3 className="font-medium text-sm">{update.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{update.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
