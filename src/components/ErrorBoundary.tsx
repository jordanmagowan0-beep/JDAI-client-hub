import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught UI error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground animate-fade-in p-6 z-50">
          <div className="flex max-w-md flex-col items-center text-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-destructive">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred in the application. Please refresh the page or contact support if the problem persists.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 w-full rounded-md bg-black/90 p-4 text-left overflow-hidden">
                <p className="font-mono text-[10px] text-red-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
