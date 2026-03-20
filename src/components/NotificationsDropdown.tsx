import React, { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects, useProjectUpdates } from '@/hooks/useData';
import { Project, ProjectUpdate } from '@/types/portal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateLabel } from '@/lib/format';

export const NotificationsDropdown: React.FC = () => {
  const { canManagePortal } = useAuth();
  const projectsQuery = useProjects();
  const projectIds = useMemo(() => (projectsQuery.data ?? []).map(p => p.id), [projectsQuery.data]);
  const updatesQuery = useProjectUpdates(projectIds);
  
  const updates = useMemo(() => {
    return (updatesQuery.data ?? [])
      .filter(u => canManagePortal || u.visible_to_client)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [updatesQuery.data, canManagePortal]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {updates.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-[340px] p-0 border-border/50 shadow-xl bg-background/95 backdrop-blur-xl">
        <DropdownMenuLabel className="p-4 bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Recent Updates</span>
            <Link to="/updates" className="text-xs text-primary hover:underline font-normal">
              View all
            </Link>
          </div>
        </DropdownMenuLabel>
        <div className="max-h-[350px] overflow-y-auto">
          {updates.length > 0 ? (
            <div className="flex flex-col">
              {updates.map(update => {
                const project = projectsQuery.data?.find(p => p.id === update.project_id);
                return (
                  <DropdownMenuItem key={update.id} asChild className="p-4 cursor-pointer focus:bg-muted/50 border-b border-border/10 last:border-0 rounded-none w-full">
                    <Link to={`/projects/${update.project_id}`} className="flex flex-col gap-1.5 items-start w-full outline-none">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-primary">{project?.title || 'Project'}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDateLabel(update.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{update.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed whitespace-pre-line">{update.body}</p>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent updates.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
