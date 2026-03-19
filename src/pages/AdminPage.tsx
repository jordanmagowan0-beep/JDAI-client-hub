import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Building2, FolderKanban, LoaderCircle, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PanelMessage } from '@/components/PortalFeedback';
import { ClientCreateDialog, ProjectCreateDialog } from '@/components/admin/AdminDialogs';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeRequests, useClients, useMilestones, useProjectUpdates, useProjects } from '@/hooks/useData';
import { usePortalAdmin } from '@/hooks/usePortalAdmin';
import { formatDateLabel } from '@/lib/format';
import { getProjectProgress } from '@/lib/portal-metrics';

type AdminTab = 'clients' | 'projects' | 'communications';

const projectStatusColors: Record<string, string> = {
  'in-progress': 'bg-primary/20 text-primary',
  planning: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  'on-hold': 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/20 text-destructive',
};

const communicationTypeColors: Record<string, string> = {
  general: 'bg-primary/10 text-primary',
  milestone: 'bg-success/20 text-success',
  meeting: 'bg-warning/20 text-warning',
  decision: 'bg-secondary text-secondary-foreground',
};

const AdminPage: React.FC = () => {
  const { user, canManagePortal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('clients');
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [projectDialogClientId, setProjectDialogClientId] = useState<string | null>(null);

  const admin = usePortalAdmin();
  const clientsQuery = useClients();
  const projectsQuery = useProjects();
  const projectIds = (projectsQuery.data ?? []).map((project) => project.id);
  const milestonesQuery = useMilestones(projectIds);
  const updatesQuery = useProjectUpdates(projectIds);
  const changeRequestsQuery = useChangeRequests(projectIds);

  if (!user || !canManagePortal) {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    clientsQuery.isLoading ||
    projectsQuery.isLoading ||
    milestonesQuery.isLoading ||
    updatesQuery.isLoading ||
    changeRequestsQuery.isLoading
  ) {
    return (
      <PanelMessage
        title="Loading admin overview"
        description="Fetching live client, project, milestone, and update data from Supabase."
        icon={LoaderCircle}
        iconClassName="animate-spin"
      />
    );
  }

  if (
    clientsQuery.error ||
    projectsQuery.error ||
    milestonesQuery.error ||
    updatesQuery.error ||
    changeRequestsQuery.error
  ) {
    return (
      <PanelMessage
        title="Unable to load admin data"
        description="The admin overview could not be loaded from Supabase."
      />
    );
  }

  const clients = clientsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];
  const updates = updatesQuery.data ?? [];
  const changeRequests = changeRequestsQuery.data ?? [];
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  const tabs = [
    { id: 'clients' as const, label: 'Clients', icon: Building2 },
    { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
    { id: 'communications' as const, label: 'Communications', icon: MessageSquare },
  ];

  const openProjectDialog = (clientId?: string | null) => {
    setProjectDialogClientId(clientId || clients[0]?.id || null);
    setIsProjectDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of accessible clients, projects, and communications</p>
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-muted/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Clients</h2>
            <Button type="button" onClick={() => setIsClientDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left font-medium text-muted-foreground">Company</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground sm:table-cell">Primary Contact</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground md:table-cell">Email</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Projects</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const projectCount = projects.filter((project) => project.client_id === client.id).length;
                  return (
                    <tr key={client.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-4 font-medium">{client.company_name}</td>
                      <td className="hidden p-4 text-muted-foreground sm:table-cell">
                        {client.primary_contact_name || 'Not set'}
                      </td>
                      <td className="hidden p-4 text-muted-foreground md:table-cell">
                        {client.primary_contact_email || 'Not set'}
                      </td>
                      <td className="p-4 text-muted-foreground">{client.status}</td>
                      <td className="p-4">
                        <span className="status-badge bg-primary/20 text-primary">{projectCount}</span>
                      </td>
                      <td className="p-4 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => openProjectDialog(client.id)}>
                          Add Project
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && (
            <PanelMessage
              title="No clients available"
              description="Add the first client to start creating portal projects from the frontend."
            />
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Projects</h2>
            <Button type="button" onClick={() => openProjectDialog()} disabled={clients.length === 0}>
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </div>

          {clients.length === 0 && (
            <PanelMessage
              title="Create a client first"
              description="A project requires a real `client_id`, so add a client before creating a project."
            />
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left font-medium text-muted-foreground">Project</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground sm:table-cell">Client</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground md:table-cell">Progress</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground lg:table-cell">Milestones</th>
                  <th className="hidden p-4 text-left font-medium text-muted-foreground lg:table-cell">Changes</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const progress = getProjectProgress(project.id, milestones);
                  const milestoneCount = milestones.filter((milestone) => milestone.project_id === project.id).length;
                  const changeCount = changeRequests.filter((request) => request.project_id === project.id).length;
                  const client = clientMap.get(project.client_id);

                  return (
                    <tr key={project.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-4 font-medium">
                        <Link to={`/projects/${project.id}`} className="transition-colors hover:text-primary">
                          {project.title}
                        </Link>
                      </td>
                      <td className="hidden p-4 text-muted-foreground sm:table-cell">{client?.company_name || '-'}</td>
                      <td className="p-4">
                        <span className={`status-badge text-xs ${projectStatusColors[project.status] || 'bg-muted text-muted-foreground'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="hidden p-4 md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="hidden p-4 text-muted-foreground lg:table-cell">{milestoneCount}</td>
                      <td className="hidden p-4 text-muted-foreground lg:table-cell">{changeCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {projects.length === 0 && (
            <PanelMessage
              title="No projects available"
              description="Projects created in the admin portal will appear here as soon as they are saved."
            />
          )}
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Communications</h2>
          <div className="glass-panel p-6">
            <div className="space-y-4">
              {updates.map((update) => {
                const project = projects.find((candidate) => candidate.id === update.project_id);
                return (
                  <div key={update.id} className="border-l-2 border-primary/30 py-2 pl-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {formatDateLabel(update.created_at) && (
                        <span className="text-xs text-muted-foreground">{formatDateLabel(update.created_at)}</span>
                      )}
                      <span
                        className={`status-badge text-xs ${
                          communicationTypeColors[update.update_type] || 'bg-primary/10 text-primary'
                        }`}
                      >
                        {update.update_type}
                      </span>
                      <span className="text-xs text-primary">{project?.title}</span>
                    </div>
                    <h3 className="text-sm font-medium">{update.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{update.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {updates.length === 0 && (
            <PanelMessage
              title="No communications available"
              description="Project updates from the `project_updates` table will appear here when they are posted."
            />
          )}
        </div>
      )}

      <ClientCreateDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        isSubmitting={admin.isCreatingClient}
        onSubmit={admin.createClient}
      />

      <ProjectCreateDialog
        open={isProjectDialogOpen}
        onOpenChange={(open) => {
          setIsProjectDialogOpen(open);
          if (!open) {
            setProjectDialogClientId(null);
          }
        }}
        isSubmitting={admin.isCreatingProject}
        clients={clients}
        defaultClientId={projectDialogClientId}
        onSubmit={admin.createProject}
      />
    </div>
  );
};

export default AdminPage;
