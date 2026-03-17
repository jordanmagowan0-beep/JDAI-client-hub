import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  deleteBudgetItem,
  deleteChangeRequest,
  deleteMilestone,
  deleteProjectGoal,
  deleteProjectScopeItem,
  deleteProjectUpdate,
  saveBudgetItem,
  saveChangeRequest,
  saveMilestone,
  saveProjectGoal,
  saveProjectScopeItem,
  saveProjectUpdate,
  updateProjectBasics,
  type ChangeRequestInput,
  type ProjectBasicsInput,
  type ProjectBudgetItemInput,
  type ProjectGoalInput,
  type ProjectMilestoneInput,
  type ProjectScopeItemInput,
  type ProjectUpdateInput,
} from '@/lib/portal-admin';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

const invalidatePortalQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['projects'] }),
    queryClient.invalidateQueries({ queryKey: ['project'] }),
    queryClient.invalidateQueries({ queryKey: ['project-milestones'] }),
    queryClient.invalidateQueries({ queryKey: ['project-updates'] }),
    queryClient.invalidateQueries({ queryKey: ['project-scope-items'] }),
    queryClient.invalidateQueries({ queryKey: ['project-goals'] }),
    queryClient.invalidateQueries({ queryKey: ['change-requests'] }),
    queryClient.invalidateQueries({ queryKey: ['project-budget-items'] }),
  ]);
};

export const usePortalAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onSuccess = (title: string, description: string) => async () => {
    await invalidatePortalQueries(queryClient);
    toast({ title, description });
  };

  const onError = (title: string) => (error: unknown) => {
    toast({
      title,
      description: getErrorMessage(error),
      variant: 'destructive',
    });
  };

  const saveProjectBasicsMutation = useMutation({
    mutationFn: (input: ProjectBasicsInput) => updateProjectBasics(input),
    onSuccess: onSuccess('Project saved', 'Project changes were saved to Supabase.'),
    onError: onError('Unable to save project'),
  });

  const saveMilestoneMutation = useMutation({
    mutationFn: (input: ProjectMilestoneInput) => saveMilestone(input),
    onSuccess: onSuccess('Milestone saved', 'Milestone changes were saved to Supabase.'),
    onError: onError('Unable to save milestone'),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: onSuccess('Milestone deleted', 'The milestone was removed from Supabase.'),
    onError: onError('Unable to delete milestone'),
  });

  const saveProjectUpdateMutation = useMutation({
    mutationFn: (input: ProjectUpdateInput) => saveProjectUpdate(input),
    onSuccess: onSuccess('Update saved', 'The project update was saved to Supabase.'),
    onError: onError('Unable to save update'),
  });

  const deleteProjectUpdateMutation = useMutation({
    mutationFn: (id: string) => deleteProjectUpdate(id),
    onSuccess: onSuccess('Update deleted', 'The project update was removed from Supabase.'),
    onError: onError('Unable to delete update'),
  });

  const saveScopeItemMutation = useMutation({
    mutationFn: (input: ProjectScopeItemInput) => saveProjectScopeItem(input),
    onSuccess: onSuccess('Scope item saved', 'The scope item was saved to Supabase.'),
    onError: onError('Unable to save scope item'),
  });

  const deleteScopeItemMutation = useMutation({
    mutationFn: (id: string) => deleteProjectScopeItem(id),
    onSuccess: onSuccess('Scope item deleted', 'The scope item was removed from Supabase.'),
    onError: onError('Unable to delete scope item'),
  });

  const saveGoalMutation = useMutation({
    mutationFn: (input: ProjectGoalInput) => saveProjectGoal(input),
    onSuccess: onSuccess('Goal saved', 'The project goal was saved to Supabase.'),
    onError: onError('Unable to save goal'),
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => deleteProjectGoal(id),
    onSuccess: onSuccess('Goal deleted', 'The project goal was removed from Supabase.'),
    onError: onError('Unable to delete goal'),
  });

  const saveChangeRequestMutation = useMutation({
    mutationFn: (input: ChangeRequestInput) => saveChangeRequest(input),
    onSuccess: onSuccess('Change request saved', 'The change request was saved to Supabase.'),
    onError: onError('Unable to save change request'),
  });

  const deleteChangeRequestMutation = useMutation({
    mutationFn: (id: string) => deleteChangeRequest(id),
    onSuccess: onSuccess('Change request deleted', 'The change request was removed from Supabase.'),
    onError: onError('Unable to delete change request'),
  });

  const saveBudgetItemMutation = useMutation({
    mutationFn: (input: ProjectBudgetItemInput) => saveBudgetItem(input),
    onSuccess: onSuccess('Budget item saved', 'The budget item was saved to Supabase.'),
    onError: onError('Unable to save budget item'),
  });

  const deleteBudgetItemMutation = useMutation({
    mutationFn: (id: string) => deleteBudgetItem(id),
    onSuccess: onSuccess('Budget item deleted', 'The budget item was removed from Supabase.'),
    onError: onError('Unable to delete budget item'),
  });

  return {
    saveProjectBasics: saveProjectBasicsMutation.mutateAsync,
    saveMilestone: saveMilestoneMutation.mutateAsync,
    deleteMilestone: deleteMilestoneMutation.mutateAsync,
    saveProjectUpdate: saveProjectUpdateMutation.mutateAsync,
    deleteProjectUpdate: deleteProjectUpdateMutation.mutateAsync,
    saveScopeItem: saveScopeItemMutation.mutateAsync,
    deleteScopeItem: deleteScopeItemMutation.mutateAsync,
    saveGoal: saveGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    saveChangeRequest: saveChangeRequestMutation.mutateAsync,
    deleteChangeRequest: deleteChangeRequestMutation.mutateAsync,
    saveBudgetItem: saveBudgetItemMutation.mutateAsync,
    deleteBudgetItem: deleteBudgetItemMutation.mutateAsync,
    isSavingProjectBasics: saveProjectBasicsMutation.isPending,
    isSavingMilestone: saveMilestoneMutation.isPending,
    isDeletingMilestone: deleteMilestoneMutation.isPending,
    isSavingProjectUpdate: saveProjectUpdateMutation.isPending,
    isDeletingProjectUpdate: deleteProjectUpdateMutation.isPending,
    isSavingScopeItem: saveScopeItemMutation.isPending,
    isDeletingScopeItem: deleteScopeItemMutation.isPending,
    isSavingGoal: saveGoalMutation.isPending,
    isDeletingGoal: deleteGoalMutation.isPending,
    isSavingChangeRequest: saveChangeRequestMutation.isPending,
    isDeletingChangeRequest: deleteChangeRequestMutation.isPending,
    isSavingBudgetItem: saveBudgetItemMutation.isPending,
    isDeletingBudgetItem: deleteBudgetItemMutation.isPending,
  };
};
