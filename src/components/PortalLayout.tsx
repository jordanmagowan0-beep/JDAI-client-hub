import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FullScreenLoader } from '@/components/PortalFeedback';
import { PortalWalkthrough } from '@/components/PortalWalkthrough';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import companyLogo from '@/assets/JDAI_Logo.png';
import {
  AlertTriangle,
  LayoutDashboard,
  FolderKanban,
  Bell,
  DollarSign,
  LogOut,
  Shield,
  Settings,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Updates', path: '/updates', icon: Bell },
  { label: 'Budget', path: '/budget', icon: DollarSign },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const PortalLayout: React.FC = () => {
  const { user, logout, isBootstrapping, isAuthenticating, profileError, canManagePortal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  if (isBootstrapping) {
    return <FullScreenLoader message="Restoring your session..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-lg text-sm font-medium transition-colors",
              mobile ? "px-4 py-3 text-base" : "px-3 py-2",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
            {item.label}
          </Link>
        );
      })}
      {canManagePortal && (
        <Link
          to="/admin"
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={cn(
            "flex items-center gap-2 rounded-lg text-sm font-medium transition-colors",
            mobile ? "px-4 py-3 text-base" : "px-3 py-2",
            location.pathname.startsWith("/admin")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Shield className={mobile ? "h-5 w-5" : "h-4 w-4"} />
          Admin
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen grid-bg relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow-blob w-[800px] h-[400px] -top-48 left-1/2 -translate-x-1/2 opacity-30" />
      </div>

      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 md:gap-8">
              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] p-0 border-r-border/30 bg-background/95 backdrop-blur-xl">
                    <SheetHeader className="p-6 border-b border-border/50 text-left">
                      <SheetTitle className="flex items-center gap-2">
                        <img src={companyLogo} alt="JDAI Solutions" className="h-6" />
                        <span className="font-display text-lg font-bold text-gradient">Portal</span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-1 p-4">
                      <NavContent mobile />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/50">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.full_name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Link to="/dashboard" className="flex items-center">
                <img src={companyLogo} alt="JDAI Solutions" className="h-7 md:h-8" />
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <NavContent />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <NotificationsDropdown />
              <PortalWalkthrough />
              <button
                onClick={logout}
                disabled={isAuthenticating}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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
