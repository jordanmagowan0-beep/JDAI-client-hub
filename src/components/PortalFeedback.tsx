import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import dmitLogo from '@/assets/dmit-logo.png';
import { cn } from '@/lib/utils';

interface PanelMessageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message = 'Loading your portal data...',
}) => (
  <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden">
    <div className="glow-blob w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 animate-pulse-glow" />
    <div className="relative z-10 w-full max-w-sm px-6">
      <div className="glass-panel p-8 text-center">
        <img src={dmitLogo} alt="DMIT Solutions" className="h-10 mx-auto object-contain mb-6" />
        <LoaderCircle className="w-8 h-8 text-primary mx-auto animate-spin" />
        <p className="text-sm text-muted-foreground mt-4">{message}</p>
      </div>
    </div>
  </div>
);

export const PanelMessage: React.FC<PanelMessageProps> = ({
  title,
  description,
  icon: Icon = AlertCircle,
  className,
  iconClassName,
}) => (
  <div className={cn('glass-panel p-10 text-center', className)}>
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
      <Icon className={cn('w-6 h-6 text-primary', iconClassName)} />
    </div>
    <h2 className="font-display text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
  </div>
);
