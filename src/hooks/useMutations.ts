import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProfile, type ProfileUpdateInput } from '@/lib/portal-profile';

export const useProfileMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateProfile(userId, input),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['portal-user'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};
