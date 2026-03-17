import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { PanelMessage } from '@/components/PortalFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectUpdates, useProjects } from '@/hooks/useData';
import { formatDateLabel } from '@/lib/format';

const typeColors: Record<string, string> = {
  general: 'bg-primary/20 text-primary',
  milestone: 'bg-success/20 text-success',
  meeting: 'bg-warning/20 text-warning',
  decision: 'bg-secondary text-secondary-foreground',
};

const UpdatesPage: React.FC = () => {
  const { canManagePortal } = useAuth();
  const projectsQuery = useProjects();
  const projectIds = (projectsQuery.data ?? []).map((project) => project.id);
  const updatesQuery = useProjectUpdates(projectIds);

  if (projectsQuery.isLoading || updatesQuery.isLoading) {
    return (
      <PanelMessage
        title="Loading updates"
        description="Fetching project communications from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (projectsQuery.error || updatesQuery.error) {
    return (
      <PanelMessage
        title="Unable to load updates"
        description="Project update data could not be retrieved from Supabase."
      />
    );
  }

  const projectMap = new Map((projectsQuery.data ?? []).map((project) => [project.id, project]));
  const updates = (updatesQuery.data ?? []).filter((update) => canManagePortal || update.visible_to_client);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Project updates and communication log</p>
      </div>

      <div className="glass-panel p-6">
        <div className="space-y-6">
          {updates.map((update) => {
            const project = projectMap.get(update.project_id);
            return (
              <div key={update.id} className="border-l-2 border-primary/30 py-2 pl-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  {formatDateLabel(update.created_at) && (
                    <span className="text-xs text-muted-foreground">{formatDateLabel(update.created_at)}</span>
                  )}
                  <span className={`status-badge text-xs ${typeColors[update.update_type] || 'bg-primary/20 text-primary'}`}>
                    {update.update_type}
                  </span>
                  {project && <span className="text-xs text-primary">{project.title}</span>}
                </div>
                <h2 className="text-sm font-medium">{update.title}</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{update.body}</p>
              </div>
            );
          })}

          {updates.length === 0 && (
            <PanelMessage
              title="No updates available"
              description={
                canManagePortal
                  ? 'Project communications posted in Supabase will appear here.'
                  : 'Updates for the projects you can access will appear here once they are published.'
              }
              className="p-8"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
