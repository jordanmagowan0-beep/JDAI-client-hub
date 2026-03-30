import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "@/components/RouteGuards";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FullScreenLoader } from "@/components/PortalFeedback";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const PortalLayout = lazy(() => import("./components/PortalLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const UpdatesPage = lazy(() => import("./pages/UpdatesPage"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const HomeRoute = () => {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullScreenLoader message="Loading the JDAI Solutions client portal..." />;
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<FullScreenLoader message="Loading..." />}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route path="/" element={<HomeRoute />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<PortalLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/updates" element={<UpdatesPage />} />
                    <Route path="/budget" element={<BudgetPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
