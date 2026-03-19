import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FullScreenLoader } from '@/components/PortalFeedback';
import { PortalWalkthrough } from '@/components/PortalWalkthrough';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import dmitLogo from '@/assets/dmit-logo.png';
import { AlertTriangle, LayoutDashboard, FolderKanban, Bell, DollarSign, LogOut, Shield, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Updates', path: '/updates', icon: Bell },
  { label: 'Budget', path: '/budget', icon: DollarSign },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const PortalLayout: React.FC = () => {
  const { user, logout, isBootstrapping, isAuthenticating, profileError, canManagePortal } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <FullScreenLoader message="Restoring your session..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen grid-bg relative">
      <div className="glow-blob w-[800px] h-[400px] -top-48 left-1/2 -translate-x-1/2 opacity-30" />

      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard">
                <img src={dmitLogo} alt="DMIT Solutions" className="h-8" />
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                {canManagePortal && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <NotificationsDropdown />
              <PortalWalkthrough />
              <button
                onClick={logout}
                disabled={isAuthenticating}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/30 overflow-x-auto">
          <div className="flex px-4 gap-1 py-2">
            {navItems.map(item => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
            {canManagePortal && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  location.pathname.startsWith('/admin') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profileError && (
          <Alert className="mb-6 border-warning/40 bg-warning/5 text-warning-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle>Profile fallback active</AlertTitle>
            <AlertDescription>
              Profile details could not be fully loaded. The portal is using safe read-only access until the profile query succeeds.
            </AlertDescription>
          </Alert>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
