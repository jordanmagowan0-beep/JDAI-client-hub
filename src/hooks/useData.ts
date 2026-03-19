import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ChangeRequest,
  Client,
  Project,
  ProjectBudgetItem,
  ProjectGoal,
  ProjectMilestone,
  ProjectScopeItem,
  ProjectUpdate,
} from '@/types/portal';
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
  type FetchProjectsOptions,
} from '@/lib/portal-data';

const createProjectKey = (projectIds?: string[]) =>
  projectIds && projectIds.length > 0 ? [...projectIds].sort() : [];

export const useProjects = (options?: FetchProjectsOptions): UseQueryResult<Project[], Error> => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', user?.id, options],
    queryFn: () => fetchProjects(options),
    enabled: !!user,
  });
};

export const useProject = (projectId?: string): UseQueryResult<Project | null, Error> => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project', projectId, user?.id],
    queryFn: () => fetchProjectById(projectId as string),
    enabled: !!user && !!projectId,
  });
};

export const useMilestones = (projectIds?: string[]): UseQueryResult<ProjectMilestone[], Error> =>
  useQuery({
    queryKey: ['project-milestones', createProjectKey(projectIds)],
    queryFn: () => fetchMilestones(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectScopeItems = (projectId?: string): UseQueryResult<ProjectScopeItem[], Error> =>
  useQuery({
    queryKey: ['project-scope-items', projectId],
    queryFn: () => fetchProjectScopeItems(projectId as string),
    enabled: !!projectId,
  });

export const useProjectGoals = (projectId?: string): UseQueryResult<ProjectGoal[], Error> =>
  useQuery({
    queryKey: ['project-goals', projectId],
    queryFn: () => fetchProjectGoals(projectId as string),
    enabled: !!projectId,
  });

export const useChangeRequests = (projectIds?: string[]): UseQueryResult<ChangeRequest[], Error> =>
  useQuery({
    queryKey: ['change-requests', createProjectKey(projectIds)],
    queryFn: () => fetchChangeRequests(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectBudgetItems = (projectIds?: string[]): UseQueryResult<ProjectBudgetItem[], Error> =>
  useQuery({
    queryKey: ['project-budget-items', createProjectKey(projectIds)],
    queryFn: () => fetchProjectBudgetItems(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useProjectUpdates = (projectIds?: string[]): UseQueryResult<ProjectUpdate[], Error> =>
  useQuery({
    queryKey: ['project-updates', createProjectKey(projectIds)],
    queryFn: () => fetchProjectUpdates(projectIds as string[]),
    enabled: !!projectIds && projectIds.length > 0,
  });

export const useClients = (): UseQueryResult<Client[], Error> => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: fetchClients,
    enabled: !!user,
  });
};
