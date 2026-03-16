import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dmitLogo from '@/assets/dmit-logo.png';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Try admin@dmit-solutions.com or client@nexacore.com');
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Glow effects */}
      <div className="glow-blob w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 animate-pulse-glow" />
      <div className="glow-blob w-[400px] h-[400px] bottom-0 right-0 animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-panel p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={dmitLogo} alt="DMIT Solutions" className="h-12 object-contain" />
          </div>

          {/* Header */}
          <h1 className="font-display text-2xl font-bold text-center mb-2">
            Welcome to the Client Portal
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Sign in to access your project dashboard and updates.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-glow w-full text-center disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Demo credentials (any password)</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="text-primary">Admin:</span> admin@dmit-solutions.com</p>
              <p><span className="text-primary">Client:</span> client@nexacore.com</p>
              <p><span className="text-primary">Client:</span> client@vaultedge.com</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © 2026 DMIT Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
