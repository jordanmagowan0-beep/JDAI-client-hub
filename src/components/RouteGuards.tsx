import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { FullScreenLoader } from '@/components/PortalFeedback';
import { useAuth } from '@/contexts/AuthContext';

export const PublicRoute: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute: React.FC = () => {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullScreenLoader message="Restoring your DMIT portal session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
