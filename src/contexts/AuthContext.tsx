import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { PortalUser } from '@/types/portal';
import { supabase } from '@/integrations/supabase/client';
import { fetchPortalUser } from '@/lib/portal-data';

const AUTH_BOOTSTRAP_TIMEOUT_MS = 2500;
const PROFILE_LOAD_TIMEOUT_MS = 2500;

interface AuthContextType {
  user: PortalUser | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  isAuthenticating: boolean;
  isProfileLoaded: boolean;
  profileError: string | null;
  canManagePortal: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, timeoutMs: number, message: string) => {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        window.setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  }, []);

  const buildFallbackUser = useCallback((authUser: SupabaseUser): PortalUser => {
    const metadata = typeof authUser.user_metadata === 'object' && authUser.user_metadata !== null
      ? (authUser.user_metadata as Record<string, unknown>)
      : {};
    const fallbackName =
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : authUser.email?.split('@')[0] || authUser.id;

    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: fallbackName,
      role: 'client',
      client_id: null,
      client_company_name: null,
    };
  }, []);

  const resolvePortalUser = useCallback(
    async (authUser: SupabaseUser | null) => {
      if (!authUser) {
        setUser(null);
        setIsProfileLoaded(false);
        setProfileError(null);
        return null;
      }

      try {
        const nextUser = await withTimeout(
          fetchPortalUser(authUser),
          PROFILE_LOAD_TIMEOUT_MS,
          'Profile loading timed out.',
        );

        setUser(nextUser);
        setIsProfileLoaded(true);
        setProfileError(null);
        return nextUser;
      } catch (error) {
        const fallbackUser = buildFallbackUser(authUser);
        const message = error instanceof Error ? error.message : 'Profile loading failed.';

        setUser(fallbackUser);
        setIsProfileLoaded(false);
        setProfileError(message);
        return fallbackUser;
      }
    },
    [buildFallbackUser, withTimeout],
  );

  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      setIsBootstrapping(true);

      try {
        const {
          data: { session },
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'Session bootstrap timed out.',
        );

        if (!isActive) return;

        if (!session?.user) {
          setUser(null);
          setIsProfileLoaded(false);
          setProfileError(null);
          return;
        }

        await resolvePortalUser(session.user);
      } catch (error) {
        if (!isActive) return;

        setUser(null);
        setIsProfileLoaded(false);
        setProfileError(error instanceof Error ? error.message : 'Unable to restore your session.');
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isActive) return;

      if (!session?.user) {
        setUser(null);
        setIsProfileLoaded(false);
        setProfileError(null);
        setIsBootstrapping(false);
        return;
      }

      await resolvePortalUser(session.user);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [resolvePortalUser, withTimeout]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setIsAuthenticating(true);
    setProfileError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return error.message;
      }

      await resolvePortalUser(data.user ?? null);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to sign in.';
    } finally {
      setIsAuthenticating(false);
      setIsBootstrapping(false);
    }
  }, [resolvePortalUser]);

  const logout = useCallback(async () => {
    setIsAuthenticating(true);

    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsProfileLoaded(false);
      setProfileError(null);
    } finally {
      setIsAuthenticating(false);
      setIsBootstrapping(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading: isBootstrapping || isAuthenticating,
      isBootstrapping,
      isAuthenticating,
      isProfileLoaded,
      profileError,
      canManagePortal: !!user && user.role === 'admin' && isProfileLoaded,
      login,
      logout,
    }),
    [isAuthenticating, isBootstrapping, isProfileLoaded, login, logout, profileError, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
