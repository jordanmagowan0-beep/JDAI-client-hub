export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  createdAt: string;
}

export interface Project {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'blocked';
  startDate: string;
  endDate: string;
  progress: number;
  health: 'healthy' | 'at-risk' | 'critical';
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'blocked';
  order: number;
}

export interface ScopeItem {
  id: string;
  projectId: string;
  category: string;
  title: string;
  description: string;
  included: boolean;
}

export interface Goal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'strategic' | 'measurable';
  metric?: string;
  target?: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  impact: 'low' | 'medium' | 'high';
  submittedDate: string;
  resolvedDate?: string;
  budgetImpact?: number;
  timelineImpact?: string;
}

export interface BudgetRecord {
  id: string;
  projectId: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  stages: BudgetStage[];
}

export interface BudgetStage {
  id: string;
  name: string;
  amount: number;
  status: 'paid' | 'invoiced' | 'upcoming';
}

export interface CommunicationUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: string;
  date: string;
  type: 'update' | 'milestone' | 'meeting' | 'decision';
}
