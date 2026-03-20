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
        <DialogContent className="flex h-[92vh] w-[95vw] max-w-3xl overflow-hidden border-primary/20 bg-background/95 p-0 sm:h-auto sm:max-h-[92vh]">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent sm:h-40" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 blur-3xl sm:h-36 sm:w-36" />

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="px-5 py-5 sm:px-8 sm:py-8">
                <DialogHeader className="space-y-3 sm:space-y-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary sm:px-3 sm:py-1 sm:text-xs">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Walkthrough
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleSkip} className="h-8 text-xs">
                      Skip
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1">
                      <DialogTitle className="font-display text-lg font-semibold sm:text-2xl">
                        Portal Guide
                      </DialogTitle>
                      <DialogDescription className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                        Quickly understand where information lives and what the data means.
                      </DialogDescription>
                    </div>
                    <div className="flex shrink-0 items-center justify-between rounded-xl border border-primary/20 bg-background/60 p-2 sm:block sm:rounded-2xl sm:p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.24em]">Step</p>
                      <p className="font-display text-lg font-semibold text-primary sm:text-2xl">
                        {activeStepIndex + 1}
                        <span className="text-sm text-muted-foreground sm:text-base">/{steps.length}</span>
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                {/* Step quick-nav */}
                <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-6 sm:grid-cols-2 sm:gap-2 xl:grid-cols-3">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors sm:rounded-2xl sm:gap-3 sm:px-4 sm:py-3',
                        index === activeStepIndex
                          ? 'border-primary/30 bg-primary/10 text-foreground'
                          : 'border-border/50 bg-background/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl',
                          index === activeStepIndex ? 'bg-primary/15 text-primary' : 'bg-background/60',
                        )}
                      >
                        <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate text-xs font-medium sm:text-sm">{step.title}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex gap-1.5 sm:mt-6 sm:gap-2">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepIndex(index)}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors sm:h-2',
                        index === activeStepIndex ? 'bg-primary' : 'bg-primary/15 hover:bg-primary/30',
                      )}
                      aria-label={`Go to ${step.title}`}
                    />
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-8 sm:pb-8">
                <div className="glass-panel p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-2xl">
                      <activeStep.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:tracking-[0.24em]">Current Page</p>
                      <h3 className="mt-1 font-display text-xl font-semibold sm:mt-2 sm:text-2xl">{activeStep.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">{activeStep.where}</p>
                      <p className="mt-3 text-xs leading-5 text-foreground/90 sm:mt-4 sm:text-sm sm:leading-6">{activeStep.meaning}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:mt-6 sm:grid-cols-2 sm:gap-3">
                    {activeStep.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-xl border border-border/60 bg-background/50 p-2.5 text-[11px] text-muted-foreground sm:rounded-2xl sm:p-3.5 sm:text-sm"
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                          <p>{highlight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-auto flex-col-reverse gap-3 border-t border-border/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button type="button" variant="outline" size="sm" onClick={goToPreviousStep} disabled={activeStepIndex === 0} className="flex-1 sm:flex-none">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {isLastStep ? (
                    <Button type="button" size="sm" onClick={handleFinish} className="flex-1 sm:flex-none">
                      Finish
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={goToNextStep} className="flex-1 sm:flex-none">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  Reopen any time via the `Guide` button.
                </p>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
