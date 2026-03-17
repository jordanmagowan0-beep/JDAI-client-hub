import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchChangeRequests,
  fetchClients,
  fetchMilestones,
  fetchProjectById,
  fetchProjectBudgetItems,
  fetchProjectGoals,
  fetchProjects,
  fetchProjectScopeItems,
  fetchProjectUpdates,
} from '@/lib/portal-data';

const createProjectKey = (projectIds?: string[]) =>
  projectIds && projectIds.length > 0 ? [...projectIds].sort() : [];

export const useProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: fetchProjects,
    enabled: !!user,
  });
};

export const useProject = (projectId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId, user?.id],
    queryFn: () => fetchProjectById(projectId as string),
    enabled: !!user && !!projectId,
  });
};

export const useMilestones = (projectIds?: string[]) =>
  useQuery({
    queryKey: ['project-milestones', createProjectKey(projectIds)],
    queryFn: () => fetchMilestones(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectScopeItems = (projectId?: string) =>
  useQuery({
    queryKey: ['project-scope-items', projectId],
    queryFn: () => fetchProjectScopeItems(projectId as string),
    enabled: !!projectId,
  });

export const useProjectGoals = (projectId?: string) =>
  useQuery({
    queryKey: ['project-goals', projectId],
    queryFn: () => fetchProjectGoals(projectId as string),
    enabled: !!projectId,
  });

export const useChangeRequests = (projectIds?: string[]) =>
  useQuery({
    queryKey: ['change-requests', createProjectKey(projectIds)],
    queryFn: () => fetchChangeRequests(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectBudgetItems = (projectIds?: string[]) =>
  useQuery({
    queryKey: ['project-budget-items', createProjectKey(projectIds)],
    queryFn: () => fetchProjectBudgetItems(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectUpdates = (projectIds?: string[]) =>
  useQuery({
    queryKey: ['project-updates', createProjectKey(projectIds)],
    queryFn: () => fetchProjectUpdates(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useClients = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: fetchClients,
    enabled: !!user,
  });
};
