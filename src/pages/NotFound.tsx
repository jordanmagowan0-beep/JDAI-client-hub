import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();
  const destination = user ? "/dashboard" : "/login";
  const label = user ? "Return to Dashboard" : "Return to Sign In";

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="glass-panel max-w-lg p-10 text-center">
        <h1 className="font-display text-5xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground mt-4">This page does not exist.</p>
        <p className="text-sm text-muted-foreground mt-2">
          The link may be outdated or the route may have changed.
        </p>
        <Link
          to={destination}
          className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          {label}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
