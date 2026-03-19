import React, { useEffect, useMemo, useState } from 'react';
import type {
  ChangeRequest,
  Project,
  ProjectBudgetItem,
  ProjectGoal,
  ProjectMilestone,
  ProjectScopeItem,
  ProjectUpdate,
} from '@/types/portal';
import {
  type ChangeRequestInput,
  type ProjectBasicsInput,
  type ProjectBudgetItemInput,
  type ProjectGoalInput,
  type ProjectMilestoneInput,
  type ProjectScopeItemInput,
  type ProjectUpdateInput,
} from '@/lib/portal-admin';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const projectStatusDefaults = ['planning', 'in-progress', 'on-hold', 'completed', 'blocked'];
const milestoneStatusDefaults = ['planned', 'in-progress', 'completed', 'blocked'];
const goalStatusDefaults = ['active', 'completed', 'paused'];
const changeStatusDefaults = ['pending', 'approved', 'rejected'];
const budgetStatusDefaults = ['planned', 'invoiced', 'paid'];
const updateTypeDefaults = ['general', 'milestone', 'meeting', 'decision'];

const withCurrentOption = (value: string | null | undefined, defaults: string[]) => {
  const options = value ? [value, ...defaults] : defaults;
  return [...new Set(options.map((option) => option.trim()).filter(Boolean))];
};

const Field: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode }> = ({
  label,
  htmlFor,
  children,
}) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

interface ControlledDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
}

interface ProjectBasicsDialogProps extends ControlledDialogProps {
  project: Project;
  onSubmit: (input: ProjectBasicsInput) => Promise<void>;
}

export const ProjectBasicsDialog: React.FC<ProjectBasicsDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  project,
  onSubmit,
}) => {
  const [title, setTitle] = useState(project.title);
  const [status, setStatus] = useState(project.status);
  const [slug, setSlug] = useState(project.slug ?? '');
  const [summary, setSummary] = useState(project.summary ?? '');
  const [start_date, setStartDate] = useState(project.start_date ?? '');
  const [target_end_date, setTargetEndDate] = useState(project.target_end_date ?? '');
  const [actual_end_date, setActualEndDate] = useState(project.actual_end_date ?? '');
  const [total_budget, setTotalBudget] = useState(String(project.total_budget));
  const [spent_budget, setSpentBudget] = useState(String(project.spent_budget));
  const [currency, setCurrency] = useState(project.currency);

  const statusOptions = useMemo(() => withCurrentOption(status, projectStatusDefaults), [status]);

  useEffect(() => {
    if (!open) return;
    setTitle(project.title);
    setStatus(project.status);
    setSlug(project.slug ?? '');
    setSummary(project.summary ?? '');
    setStartDate(project.start_date ?? '');
    setTargetEndDate(project.target_end_date ?? '');
    setActualEndDate(project.actual_end_date ?? '');
    setTotalBudget(String(project.total_budget));
    setSpentBudget(String(project.spent_budget));
    setCurrency(project.currency);
  }, [open, project]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        project_id: project.id,
        title,
        status,
        slug,
        summary,
        start_date,
        target_end_date,
        actual_end_date,
        total_budget,
        spent_budget,
        currency,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Save exact `projects` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="project-title">
              <Input id="project-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Slug" htmlFor="project-slug">
              <Input id="project-slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
            </Field>

            <Field label="Currency" htmlFor="project-currency">
              <Input
                id="project-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                required
              />
            </Field>

            <Field label="Start Date" htmlFor="project-start-date">
              <Input
                id="project-start-date"
                type="date"
                value={start_date}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>

            <Field label="Target End Date" htmlFor="project-target-end-date">
              <Input
                id="project-target-end-date"
                type="date"
                value={target_end_date}
                onChange={(event) => setTargetEndDate(event.target.value)}
              />
            </Field>

            <Field label="Actual End Date" htmlFor="project-actual-end-date">
              <Input
                id="project-actual-end-date"
                type="date"
                value={actual_end_date}
                onChange={(event) => setActualEndDate(event.target.value)}
              />
            </Field>

            <Field label="Total Budget" htmlFor="project-total-budget">
              <Input
                id="project-total-budget"
                type="number"
                step="0.01"
                value={total_budget}
                onChange={(event) => setTotalBudget(event.target.value)}
                required
              />
            </Field>

            <Field label="Spent Budget" htmlFor="project-spent-budget">
              <Input
                id="project-spent-budget"
                type="number"
                step="0.01"
                value={spent_budget}
                onChange={(event) => setSpentBudget(event.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Summary" htmlFor="project-summary">
            <Textarea
              id="project-summary"
              rows={5}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface MilestoneDialogProps extends ControlledDialogProps {
  milestone?: ProjectMilestone | null;
  project_id: string;
  onSubmit: (input: ProjectMilestoneInput) => Promise<void>;
}

export const MilestoneDialog: React.FC<MilestoneDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  milestone,
  project_id,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestone_date, setMilestoneDate] = useState('');
  const [status, setStatus] = useState('planned');
  const [sort_order, setSortOrder] = useState('0');

  const statusOptions = useMemo(() => withCurrentOption(status, milestoneStatusDefaults), [status]);

  useEffect(() => {
    if (!open) return;
    setTitle(milestone?.title ?? '');
    setDescription(milestone?.description ?? '');
    setMilestoneDate(milestone?.milestone_date ?? '');
    setStatus(milestone?.status ?? 'planned');
    setSortOrder(String(milestone?.sort_order ?? 0));
  }, [milestone, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: milestone?.id,
        project_id,
        title,
        description,
        milestone_date,
        status,
        sort_order,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{milestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
            <DialogDescription>Save exact `project_milestones` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Title" htmlFor="milestone-title">
            <Input id="milestone-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>

          <Field label="Description" htmlFor="milestone-description">
            <Textarea
              id="milestone-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Milestone Date" htmlFor="milestone-date">
              <Input
                id="milestone-date"
                type="date"
                value={milestone_date}
                onChange={(event) => setMilestoneDate(event.target.value)}
              />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Sort Order" htmlFor="milestone-sort-order">
              <Input
                id="milestone-sort-order"
                type="number"
                value={sort_order}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : milestone ? 'Save Milestone' : 'Create Milestone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ProjectUpdateDialogProps extends ControlledDialogProps {
  update?: ProjectUpdate | null;
  project_id: string;
  onSubmit: (input: ProjectUpdateInput) => Promise<void>;
}

export const ProjectUpdateDialog: React.FC<ProjectUpdateDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  update,
  project_id,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [update_type, setUpdateType] = useState('general');
  const [visible_to_client, setVisibleToClient] = useState(true);

  const updateTypeOptions = useMemo(() => withCurrentOption(update_type, updateTypeDefaults), [update_type]);

  useEffect(() => {
    if (!open) return;
    setTitle(update?.title ?? '');
    setBody(update?.body ?? '');
    setUpdateType(update?.update_type ?? 'general');
    setVisibleToClient(update?.visible_to_client ?? true);
  }, [open, update]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: update?.id,
        project_id,
        title,
        body,
        update_type,
        visible_to_client,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{update ? 'Edit Project Update' : 'Add Project Update'}</DialogTitle>
            <DialogDescription>Save exact `project_updates` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Title" htmlFor="project-update-title">
            <Input id="project-update-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>

          <Field label="Body" htmlFor="project-update-body">
            <Textarea
              id="project-update-body"
              rows={6}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
            />
          </Field>

          <Field label="Update Type">
            <Select value={update_type} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                {updateTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Visible to client</p>
              <p className="text-xs text-muted-foreground">Turn off to keep this update internal-only.</p>
            </div>
            <Switch checked={visible_to_client} onCheckedChange={setVisibleToClient} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : update ? 'Save Update' : 'Create Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ScopeItemDialogProps extends ControlledDialogProps {
  scopeItem?: ProjectScopeItem | null;
  project_id: string;
  onSubmit: (input: ProjectScopeItemInput) => Promise<void>;
}

export const ScopeItemDialog: React.FC<ScopeItemDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  scopeItem,
  project_id,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [included, setIncluded] = useState(true);
  const [sort_order, setSortOrder] = useState('0');

  useEffect(() => {
    if (!open) return;
    setTitle(scopeItem?.title ?? '');
    setDescription(scopeItem?.description ?? '');
    setCategory(scopeItem?.category ?? '');
    setIncluded(scopeItem?.included ?? true);
    setSortOrder(String(scopeItem?.sort_order ?? 0));
  }, [open, scopeItem]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: scopeItem?.id,
        project_id,
        title,
        description,
        category,
        included,
        sort_order,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{scopeItem ? 'Edit Scope Item' : 'Add Scope Item'}</DialogTitle>
            <DialogDescription>Save exact `project_scope_items` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Title" htmlFor="scope-item-title">
            <Input id="scope-item-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>

          <Field label="Description" htmlFor="scope-item-description">
            <Textarea
              id="scope-item-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="scope-item-category">
              <Input id="scope-item-category" value={category} onChange={(event) => setCategory(event.target.value)} />
            </Field>

            <Field label="Sort Order" htmlFor="scope-item-sort-order">
              <Input
                id="scope-item-sort-order"
                type="number"
                value={sort_order}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Included in scope</p>
              <p className="text-xs text-muted-foreground">Turn off to mark the item as excluded.</p>
            </div>
            <Switch checked={included} onCheckedChange={setIncluded} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : scopeItem ? 'Save Scope Item' : 'Create Scope Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface GoalDialogProps extends ControlledDialogProps {
  goal?: ProjectGoal | null;
  project_id: string;
  onSubmit: (input: ProjectGoalInput) => Promise<void>;
}

export const GoalDialog: React.FC<GoalDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  goal,
  project_id,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target_metric, setTargetMetric] = useState('');
  const [status, setStatus] = useState('active');
  const [sort_order, setSortOrder] = useState('0');

  const statusOptions = useMemo(() => withCurrentOption(status, goalStatusDefaults), [status]);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? '');
    setDescription(goal?.description ?? '');
    setTargetMetric(goal?.target_metric ?? '');
    setStatus(goal?.status ?? 'active');
    setSortOrder(String(goal?.sort_order ?? 0));
  }, [goal, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: goal?.id,
        project_id,
        title,
        description,
        target_metric,
        status,
        sort_order,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{goal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
            <DialogDescription>Save exact `project_goals` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Title" htmlFor="goal-title">
            <Input id="goal-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </Field>

          <Field label="Description" htmlFor="goal-description">
            <Textarea
              id="goal-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <Field label="Target Metric" htmlFor="goal-target-metric">
            <Input
              id="goal-target-metric"
              value={target_metric}
              onChange={(event) => setTargetMetric(event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Sort Order" htmlFor="goal-sort-order">
              <Input
                id="goal-sort-order"
                type="number"
                value={sort_order}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : goal ? 'Save Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ChangeRequestDialogProps extends ControlledDialogProps {
  changeRequest?: ChangeRequest | null;
  project_id: string;
  onSubmit: (input: ChangeRequestInput) => Promise<void>;
}

export const ChangeRequestDialog: React.FC<ChangeRequestDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  changeRequest,
  project_id,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [impact_summary, setImpactSummary] = useState('');
  const [budget_impact, setBudgetImpact] = useState('0');
  const [timeline_impact_days, setTimelineImpactDays] = useState('0');

  const statusOptions = useMemo(() => withCurrentOption(status, changeStatusDefaults), [status]);

  useEffect(() => {
    if (!open) return;
    setTitle(changeRequest?.title ?? '');
    setDescription(changeRequest?.description ?? '');
    setStatus(changeRequest?.status ?? 'pending');
    setImpactSummary(changeRequest?.impact_summary ?? '');
    setBudgetImpact(String(changeRequest?.budget_impact ?? 0));
    setTimelineImpactDays(String(changeRequest?.timeline_impact_days ?? 0));
  }, [changeRequest, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: changeRequest?.id,
        project_id,
        title,
        description,
        status,
        impact_summary,
        budget_impact,
        timeline_impact_days,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{changeRequest ? 'Edit Change Request' : 'Add Change Request'}</DialogTitle>
            <DialogDescription>Save exact `change_requests` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Title" htmlFor="change-request-title">
            <Input
              id="change-request-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>

          <Field label="Description" htmlFor="change-request-description">
            <Textarea
              id="change-request-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <Field label="Impact Summary" htmlFor="change-request-impact-summary">
            <Textarea
              id="change-request-impact-summary"
              rows={3}
              value={impact_summary}
              onChange={(event) => setImpactSummary(event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Budget Impact" htmlFor="change-request-budget-impact">
              <Input
                id="change-request-budget-impact"
                type="number"
                step="0.01"
                value={budget_impact}
                onChange={(event) => setBudgetImpact(event.target.value)}
                required
              />
            </Field>

            <Field label="Timeline Impact Days" htmlFor="change-request-timeline-impact-days">
              <Input
                id="change-request-timeline-impact-days"
                type="number"
                value={timeline_impact_days}
                onChange={(event) => setTimelineImpactDays(event.target.value)}
                required
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : changeRequest ? 'Save Change Request' : 'Create Change Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface BudgetItemDialogProps extends ControlledDialogProps {
  budgetItem?: ProjectBudgetItem | null;
  project_id: string;
  onSubmit: (input: ProjectBudgetItemInput) => Promise<void>;
}

export const BudgetItemDialog: React.FC<BudgetItemDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  budgetItem,
  project_id,
  onSubmit,
}) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('planned');
  const [sort_order, setSortOrder] = useState('0');

  const statusOptions = useMemo(() => withCurrentOption(status, budgetStatusDefaults), [status]);

  useEffect(() => {
    if (!open) return;
    setLabel(budgetItem?.label ?? '');
    setAmount(String(budgetItem?.amount ?? 0));
    setCategory(budgetItem?.category ?? '');
    setStatus(budgetItem?.status ?? 'planned');
    setSortOrder(String(budgetItem?.sort_order ?? 0));
  }, [budgetItem, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        id: budgetItem?.id,
        project_id,
        label,
        amount,
        category,
        status,
        sort_order,
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{budgetItem ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
            <DialogDescription>Save exact `project_budget_items` columns directly to Supabase.</DialogDescription>
          </DialogHeader>

          <Field label="Label" htmlFor="budget-item-label">
            <Input id="budget-item-label" value={label} onChange={(event) => setLabel(event.target.value)} required />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount" htmlFor="budget-item-amount">
              <Input
                id="budget-item-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </Field>

            <Field label="Category" htmlFor="budget-item-category">
              <Input
                id="budget-item-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Sort Order" htmlFor="budget-item-sort-order">
              <Input
                id="budget-item-sort-order"
                type="number"
                value={sort_order}
                onChange={(event) => setSortOrder(event.target.value)}
                required
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : budgetItem ? 'Save Budget Item' : 'Create Budget Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
