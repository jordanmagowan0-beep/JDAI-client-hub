import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenText,
  CheckCircle2,
  DollarSign,
  FolderKanban,
  LayoutDashboard,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const WALKTHROUGH_VERSION = 'v1';
const STORAGE_PREFIX = 'dmit-portal-walkthrough';

interface WalkthroughStep {
  id: string;
  title: string;
  icon: LucideIcon;
  where: string;
  meaning: string;
  highlights: string[];
}

const baseSteps: WalkthroughStep[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    where: 'Open `Dashboard` from the top navigation.',
    meaning: 'This is the quickest view of overall project movement and what needs attention first.',
    highlights: [
      'Active Projects shows work that is currently moving.',
      'Completed Milestones tells you how much of the timeline has been delivered.',
      'Pending Changes surfaces open scope, budget, or timeline decisions.',
      'Budget Utilised compares spend against the total approved budget.',
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderKanban,
    where: 'Open `Projects` to see every project you can access.',
    meaning: 'Each project card gives you status, dates, budget position, and a direct route into the full workspace.',
    highlights: [
      'Status badges show the current delivery state of each project.',
      'Progress is based on completed milestones, not placeholder percentages.',
      'Budget, spent, and remaining values come from the live project record.',
    ],
  },
  {
    id: 'project-detail',
    title: 'Project Workspace',
    icon: Target,
    where: 'Open any project card to reach the detailed project workspace.',
    meaning: 'This is where the project is fully broken down so clients can understand delivery, scope, change, budget, and updates.',
    highlights: [
      'Milestones are the key checkpoints and target dates in the timeline.',
      'Scope items show what is included or excluded from delivery.',
      'Goals track the outcomes or target metrics the project is aiming for.',
      'Change requests log adjustments that may affect scope, budget, or timing.',
      'Budget items break project costs into visible line items.',
      'Updates are the running communication log for progress and decisions.',
    ],
  },
  {
    id: 'updates',
    title: 'Updates',
    icon: Bell,
    where: 'Open `Updates` to read the communication history across your projects.',
    meaning: 'Use this page when you want the latest notes, milestones, meetings, or decisions in one place.',
    highlights: [
      'Each entry is dated so you can follow project activity over time.',
      'Update type badges explain whether the note is general, a milestone, a meeting, or a decision.',
      'Client users only see updates marked as visible to clients.',
    ],
  },
  {
    id: 'budget',
    title: 'Budget',
    icon: DollarSign,
    where: 'Open `Budget` to review financial position across accessible projects.',
    meaning: 'This page explains where budget stands overall and which budget items make up the spend plan.',
    highlights: [
      'Total Budget is the approved project budget.',
      'Spent shows how much of that budget has already been used.',
      'Remaining shows what is still available against the current project totals.',
      'Budget items show the planned, invoiced, or paid line items underneath each project.',
    ],
  },
];

const adminStep: WalkthroughStep = {
  id: 'admin',
  title: 'Admin Tools',
  icon: Shield,
  where: 'Admins can open `Admin` from the top navigation.',
  meaning: 'This is the control area for managing clients, projects, and portal content directly from the frontend.',
  highlights: [
    'Add new clients directly into the `clients` table.',
    'Create new projects and connect them to a real client record.',
    'Review projects, communications, and linked delivery activity in one place.',
  ],
};

export const PortalWalkthrough: React.FC = () => {
  const { user, canManagePortal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const steps = useMemo(
    () => (canManagePortal ? [...baseSteps, adminStep] : baseSteps),
    [canManagePortal],
  );

  const storageKey = user ? `${STORAGE_PREFIX}:${WALKTHROUGH_VERSION}:${user.id}` : null;
  const activeStep = steps[activeStepIndex];
  const isLastStep = activeStepIndex === steps.length - 1;

  useEffect(() => {
    setHasCheckedStorage(false);
    setActiveStepIndex(0);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || hasCheckedStorage) {
      return;
    }

    setHasCheckedStorage(true);

    const hasSeenWalkthrough = window.localStorage.getItem(storageKey);
    if (!hasSeenWalkthrough) {
      setIsOpen(true);
    }
  }, [hasCheckedStorage, storageKey]);

  const persistWalkthroughState = () => {
    if (!storageKey) return;
    window.localStorage.setItem(storageKey, 'seen');
  };

  const openGuide = () => {
    setActiveStepIndex(0);
    setIsOpen(true);
  };

  const handleSkip = () => {
    persistWalkthroughState();
    setIsOpen(false);
  };

  const handleFinish = () => {
    persistWalkthroughState();
    setIsOpen(false);
  };

  const goToPreviousStep = () => {
    setActiveStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const goToNextStep = () => {
    setActiveStepIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1));
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={openGuide} className="gap-2">
        <BookOpenText className="h-4 w-4" />
        <span className="hidden sm:inline">Guide</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex max-h-[92vh] overflow-hidden border-primary/20 bg-background/95 p-0 sm:max-w-3xl">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <DialogHeader className="space-y-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Portal Walkthrough
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleSkip}>
                      Skip
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <DialogTitle className="font-display text-2xl font-semibold">
                        Find everything you need in the portal
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm text-muted-foreground">
                        This guide walks through each key page so clients can quickly understand where project information lives and what the portal data means.
                      </DialogDescription>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-background/60 p-4 text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Step</p>
                      <p className="font-display text-2xl font-semibold text-primary">
                        {activeStepIndex + 1}
                        <span className="text-base text-muted-foreground">/{steps.length}</span>
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                        index === activeStepIndex
                          ? 'border-primary/30 bg-primary/10 text-foreground'
                          : 'border-border/50 bg-background/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          index === activeStepIndex ? 'bg-primary/15 text-primary' : 'bg-background/60',
                        )}
                      >
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                          Step {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium">{step.title}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={cn(
                        'h-2 flex-1 rounded-full transition-colors',
                        index === activeStepIndex ? 'bg-primary' : 'bg-primary/15 hover:bg-primary/30',
                      )}
                      aria-label={`Go to ${step.title}`}
                    />
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="glass-panel p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <activeStep.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Current Page</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{activeStep.title}</h3>
                      <p className="mt-3 text-sm text-muted-foreground">{activeStep.where}</p>
                      <p className="mt-4 text-sm leading-6 text-foreground/90">{activeStep.meaning}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {activeStep.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-2xl border border-border/60 bg-background/50 p-3.5 text-sm text-muted-foreground"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <p>{highlight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-auto flex-col-reverse gap-3 border-t border-border/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={activeStepIndex === 0}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {isLastStep ? (
                    <Button type="button" onClick={handleFinish}>
                      Finish
                    </Button>
                  ) : (
                    <Button type="button" onClick={goToNextStep}>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  You can reopen this guide any time from the `Guide` button in the top navigation.
                </p>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
