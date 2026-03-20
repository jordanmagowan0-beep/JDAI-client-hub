import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileMutation } from '@/hooks/useMutations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, LoaderCircle, User, Lock, Mail } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const profileMutation = useProfileMutation(user?.id || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    profileMutation.mutate({
      full_name: fullName,
      password: password || undefined
    }, {
      onSuccess: () => {
        setPassword('');
        setConfirmPassword('');
      }
    });
  };

  const isSaving = profileMutation.isPending;
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in pb-10">
      <div className="px-1 sm:px-0">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account profile and preferences.</p>
      </div>

      <div className="glass-panel p-4 sm:p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              Profile Details
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-md border border-input bg-muted/50 px-10 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Email cannot be changed directly.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-10 py-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/50" />

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Lock className="h-5 w-5 text-primary" />
              Security
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-md border border-input bg-transparent px-10 py-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-md border border-input bg-transparent px-10 py-2.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
