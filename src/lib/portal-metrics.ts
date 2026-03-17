import type { Project, ProjectMilestone } from '@/types/portal';

export const getProjectProgress = (projectId: string, milestones: ProjectMilestone[]) => {
  const projectMilestones = milestones.filter((milestone) => milestone.project_id === projectId);

  if (projectMilestones.length === 0) {
    return 0;
  }

  const completedCount = projectMilestones.filter((milestone) => milestone.status === 'completed').length;
  return Math.round((completedCount / projectMilestones.length) * 100);
};

export const getProjectBudgetRemaining = (project: Project) =>
  Math.max(project.total_budget - project.spent_budget, 0);

export const getProjectBudgetUtilisation = (project: Project) =>
  project.total_budget > 0 ? Math.round((project.spent_budget / project.total_budget) * 100) : 0;
