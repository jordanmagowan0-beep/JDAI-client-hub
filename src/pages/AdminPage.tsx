import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { demoCompanies, demoProjects, demoMilestones, demoCommunications, demoChangeRequests, demoBudgets } from '@/data/demo-data';
import { Building2, FolderKanban, Users, MessageSquare, DollarSign, Plus } from 'lucide-react';

type AdminTab = 'clients' | 'projects' | 'communications';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('clients');

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const tabs = [
    { id: 'clients' as const, label: 'Clients', icon: Building2 },
    { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
    { id: 'communications' as const, label: 'Communications', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage clients, projects, and portal content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Clients */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Clients</h2>
            <button className="btn-primary-glow text-sm flex items-center gap-2 px-4 py-2">
              <Plus className="w-4 h-4" /> Add Client
            </button>
          </div>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Company</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden sm:table-cell">Contact</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Industry</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {demoCompanies.map(company => {
                  const projectCount = demoProjects.filter(p => p.companyId === company.id).length;
                  return (
                    <tr key={company.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{company.name}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{company.contactName}</td>
                      <td className="p-4 text-muted-foreground hidden md:table-cell">{company.industry}</td>
                      <td className="p-4"><span className="status-badge bg-primary/20 text-primary">{projectCount}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">All Projects</h2>
            <button className="btn-primary-glow text-sm flex items-center gap-2 px-4 py-2">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Project</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden sm:table-cell">Client</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden md:table-cell">Progress</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Milestones</th>
                  <th className="text-left p-4 text-muted-foreground font-medium hidden lg:table-cell">Changes</th>
                </tr>
              </thead>
              <tbody>
                {demoProjects.map(project => {
                  const company = demoCompanies.find(c => c.id === project.companyId);
                  const milestoneCount = demoMilestones.filter(m => m.projectId === project.id).length;
                  const changeCount = demoChangeRequests.filter(cr => cr.projectId === project.id).length;
                  const statusColors: Record<string, string> = {
                    'in-progress': 'bg-primary/20 text-primary',
                    'planning': 'bg-warning/20 text-warning',
                    'completed': 'bg-success/20 text-success',
                    'on-hold': 'bg-muted text-muted-foreground',
                    'blocked': 'bg-destructive/20 text-destructive',
                  };
                  return (
                    <tr key={project.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{project.title}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{company?.name}</td>
                      <td className="p-4"><span className={`status-badge text-xs ${statusColors[project.status]}`}>{project.status.replace('-', ' ')}</span></td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{milestoneCount}</td>
                      <td className="p-4 text-muted-foreground hidden lg:table-cell">{changeCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Communications */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Communications</h2>
            <button className="btn-primary-glow text-sm flex items-center gap-2 px-4 py-2">
              <Plus className="w-4 h-4" /> Post Update
            </button>
          </div>
          <div className="glass-panel p-6">
            <div className="space-y-4">
              {demoCommunications.sort((a, b) => b.date.localeCompare(a.date)).map(update => {
                const project = demoProjects.find(p => p.id === update.projectId);
                return (
                  <div key={update.id} className="border-l-2 border-primary/30 pl-4 py-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{update.date}</span>
                      <span className="status-badge bg-primary/10 text-primary text-xs">{update.type}</span>
                      <span className="text-xs text-primary">{project?.title}</span>
                    </div>
                    <h3 className="font-medium text-sm">{update.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{update.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
