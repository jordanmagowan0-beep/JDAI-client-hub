import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoProjects, demoCompanies } from '@/data/demo-data';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

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

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const projects = isAdmin ? demoProjects : demoProjects.filter(p => p.companyId === user?.companyId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin ? 'All client projects' : 'Your active and upcoming projects'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => {
          const health = healthLabels[project.health];
          const company = demoCompanies.find(c => c.id === project.companyId);
          return (
            <Link key={project.id} to={`/projects/${project.id}`} className="glass-panel-hover p-6 block">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-display font-semibold">{project.title}</h3>
                  {isAdmin && company && <p className="text-xs text-muted-foreground mt-0.5">{company.name}</p>}
                </div>
                <span className={`status-badge ${statusColors[project.status]} shrink-0`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className={health.color}>{health.label}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.startDate} → {project.endDate}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
                <span className="text-primary text-xs flex items-center gap-1">View details <ArrowRight className="w-3 h-3" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsPage;
