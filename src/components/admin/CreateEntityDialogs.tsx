import React, { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import type { Client } from '@/types/portal';
import type { ClientCreateInput, ProjectCreateInput } from '@/lib/portal-admin';

const clientStatusOptions = ['active', 'inactive'];
const projectStatusOptions = ['planning', 'in-progress', 'on-hold', 'completed', 'blocked'];

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

interface ClientCreateDialogProps extends ControlledDialogProps {
  onSubmit: (input: ClientCreateInput) => Promise<void>;
}

export const ClientCreateDialog: React.FC<ClientCreateDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}) => {
  const [company_name, setCompanyName] = useState('');
  const [primary_contact_name, setPrimaryContactName] = useState('');
  const [primary_contact_email, setPrimaryContactEmail] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (!open) return;
    setCompanyName('');
    setPrimaryContactName('');
    setPrimaryContactEmail('');
    setStatus('active');
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        company_name,
        primary_contact_name,
        primary_contact_email,
        status,
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
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>Create a new row in the `clients` table from the admin portal.</DialogDescription>
          </DialogHeader>

          <Field label="Company Name" htmlFor="client-company-name">
            <Input
              id="client-company-name"
              value={company_name}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary Contact Name" htmlFor="client-contact-name">
              <Input
                id="client-contact-name"
                value={primary_contact_name}
                onChange={(event) => setPrimaryContactName(event.target.value)}
              />
            </Field>

            <Field label="Primary Contact Email" htmlFor="client-contact-email">
              <Input
                id="client-contact-email"
                type="email"
                value={primary_contact_email}
                onChange={(event) => setPrimaryContactEmail(event.target.value)}
              />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client status" />
                </SelectTrigger>
                <SelectContent>
                  {clientStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ProjectCreateDialogProps extends ControlledDialogProps {
  clients: Client[];
  defaultClientId?: string | null;
  onSubmit: (input: ProjectCreateInput) => Promise<void>;
}

export const ProjectCreateDialog: React.FC<ProjectCreateDialogProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  clients,
  defaultClientId,
  onSubmit,
}) => {
  const [client_id, setClientId] = useState(defaultClientId || '');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('planning');
  const [summary, setSummary] = useState('');
  const [start_date, setStartDate] = useState('');
  const [target_end_date, setTargetEndDate] = useState('');
  const [actual_end_date, setActualEndDate] = useState('');
  const [total_budget, setTotalBudget] = useState('0');
  const [spent_budget, setSpentBudget] = useState('0');
  const [currency, setCurrency] = useState('GBP');

  useEffect(() => {
    if (!open) return;
    setClientId(defaultClientId || clients[0]?.id || '');
    setTitle('');
    setSlug('');
    setStatus('planning');
    setSummary('');
    setStartDate('');
    setTargetEndDate('');
    setActualEndDate('');
    setTotalBudget('0');
    setSpentBudget('0');
    setCurrency('GBP');
  }, [clients, defaultClientId, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onSubmit({
        client_id,
        title,
        slug,
        status,
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
            <DialogTitle>Add Project</DialogTitle>
            <DialogDescription>Create a new row in the `projects` table and attach it to a real client.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client">
              <Select value={client_id} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Title" htmlFor="project-create-title">
              <Input
                id="project-create-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>

            <Field label="Slug" htmlFor="project-create-slug">
              <Input id="project-create-slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
            </Field>

            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Currency" htmlFor="project-create-currency">
              <Input
                id="project-create-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                required
              />
            </Field>

            <Field label="Start Date" htmlFor="project-create-start-date">
              <Input
                id="project-create-start-date"
                type="date"
                value={start_date}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </Field>

            <Field label="Target End Date" htmlFor="project-create-target-end-date">
              <Input
                id="project-create-target-end-date"
                type="date"
                value={target_end_date}
                onChange={(event) => setTargetEndDate(event.target.value)}
              />
            </Field>

            <Field label="Actual End Date" htmlFor="project-create-actual-end-date">
              <Input
                id="project-create-actual-end-date"
                type="date"
                value={actual_end_date}
                onChange={(event) => setActualEndDate(event.target.value)}
              />
            </Field>

            <Field label="Total Budget" htmlFor="project-create-total-budget">
              <Input
                id="project-create-total-budget"
                type="number"
                step="0.01"
                value={total_budget}
                onChange={(event) => setTotalBudget(event.target.value)}
                required
              />
            </Field>

            <Field label="Spent Budget" htmlFor="project-create-spent-budget">
              <Input
                id="project-create-spent-budget"
                type="number"
                step="0.01"
                value={spent_budget}
                onChange={(event) => setSpentBudget(event.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Summary" htmlFor="project-create-summary">
            <Textarea
              id="project-create-summary"
              rows={5}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || clients.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
