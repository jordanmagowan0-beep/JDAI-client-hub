import { supabase } from '@/integrations/supabase/client';

export interface ProfileUpdateInput {
  full_name: string;
  password?: string;
}

export const updateProfile = async (id: string, input: ProfileUpdateInput) => {
  if (input.password) {
    const { error: authError } = await supabase.auth.updateUser({
      password: input.password,
      data: { full_name: input.full_name }
    });
    if (authError) throw authError;
  } else {
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: input.full_name }
    });
    if (authError) throw authError;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: input.full_name })
    .eq('id', id);
    
  if (profileError) throw profileError;
};
