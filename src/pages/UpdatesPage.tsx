import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoCommunications, demoProjects, demoCompanies } from '@/data/demo-data';
import { MessageSquare } from 'lucide-react';

const typeColors: Record<string, string> = {
  update: 'bg-primary/20 text-primary',
  milestone: 'bg-success/20 text-success',
  meeting: 'bg-warning/20 text-warning',
  decision: 'bg-secondary text-secondary-foreground',
};

const UpdatesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const projectIds = isAdmin
    ? demoProjects.map(p => p.id)
    : demoProjects.filter(p => p.companyId === user?.companyId).map(p => p.id);

  const updates = demoCommunications
    .filter(c => projectIds.includes(c.projectId))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Updates</h1>
        <p className="text-muted-foreground text-sm mt-1">Project updates and communication log</p>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-6">
          {updates.map(update => {
            const project = demoProjects.find(p => p.id === update.projectId);
            return (
              <div key={update.id} className="border-l-2 border-primary/30 pl-4 py-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                  <span className={`status-badge text-xs ${typeColors[update.type]}`}>{update.type}</span>
                  {project && <span className="text-xs text-primary">{project.title}</span>}
                </div>
                <h3 className="font-medium text-sm">{update.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{update.content}</p>
                <p className="text-xs text-muted-foreground mt-2">— {update.author}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
