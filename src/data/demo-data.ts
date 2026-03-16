import { Company, Project, Milestone, ScopeItem, Goal, ChangeRequest, BudgetRecord, CommunicationUpdate, User } from '@/types/portal';

export const demoUsers: User[] = [
  { id: 'u1', email: 'admin@dmit-solutions.com', name: 'Alex Morgan', role: 'admin' },
  { id: 'u2', email: 'client@nexacore.com', name: 'Sarah Chen', role: 'client', companyId: 'c1' },
  { id: 'u3', email: 'client@vaultedge.com', name: 'James Rivera', role: 'client', companyId: 'c2' },
];

export const demoCompanies: Company[] = [
  { id: 'c1', name: 'NexaCore Industries', contactName: 'Sarah Chen', contactEmail: 'sarah@nexacore.com', industry: 'Manufacturing & Logistics', createdAt: '2025-09-15' },
  { id: 'c2', name: 'VaultEdge Financial', contactName: 'James Rivera', contactEmail: 'james@vaultedge.com', industry: 'Financial Services', createdAt: '2025-11-01' },
  { id: 'c3', name: 'BrightPath Health', contactName: 'Dr. Lena Park', contactEmail: 'lena@brightpath.com', industry: 'Healthcare', createdAt: '2026-01-10' },
];

export const demoProjects: Project[] = [
  { id: 'p1', companyId: 'c1', title: 'AI-Powered Inventory Forecasting Platform', description: 'End-to-end machine learning system for demand prediction and automated inventory management across 12 warehouses.', status: 'in-progress', startDate: '2025-10-01', endDate: '2026-06-30', progress: 62, health: 'healthy' },
  { id: 'p2', companyId: 'c1', title: 'Supply Chain Automation Suite', description: 'Intelligent automation of procurement workflows, vendor management, and logistics coordination.', status: 'planning', startDate: '2026-03-01', endDate: '2026-12-15', progress: 8, health: 'healthy' },
  { id: 'p3', companyId: 'c2', title: 'Compliance Monitoring & Reporting Engine', description: 'Automated regulatory compliance tracking with real-time alerts and audit-ready reporting.', status: 'in-progress', startDate: '2025-12-01', endDate: '2026-08-30', progress: 41, health: 'at-risk' },
  { id: 'p4', companyId: 'c3', title: 'Patient Intake Automation System', description: 'Smart forms, automated triage, and integrated EHR pipeline for streamlined patient onboarding.', status: 'in-progress', startDate: '2026-01-15', endDate: '2026-07-30', progress: 28, health: 'healthy' },
];

export const demoMilestones: Milestone[] = [
  { id: 'm1', projectId: 'p1', title: 'Discovery & Data Audit', description: 'Map data sources, assess quality, define ML requirements', dueDate: '2025-11-15', status: 'completed', order: 1 },
  { id: 'm2', projectId: 'p1', title: 'Model Architecture & Training', description: 'Build and validate forecasting models using historical data', dueDate: '2026-01-30', status: 'completed', order: 2 },
  { id: 'm3', projectId: 'p1', title: 'Platform Integration', description: 'Connect models to warehouse management systems', dueDate: '2026-03-31', status: 'in-progress', order: 3 },
  { id: 'm4', projectId: 'p1', title: 'UAT & Refinement', description: 'User acceptance testing and model tuning', dueDate: '2026-05-15', status: 'planned', order: 4 },
  { id: 'm5', projectId: 'p1', title: 'Production Launch', description: 'Full deployment across all warehouses', dueDate: '2026-06-30', status: 'planned', order: 5 },
  { id: 'm6', projectId: 'p3', title: 'Regulatory Framework Mapping', description: 'Map all compliance requirements', dueDate: '2026-01-15', status: 'completed', order: 1 },
  { id: 'm7', projectId: 'p3', title: 'Rule Engine Development', description: 'Build automated compliance checking engine', dueDate: '2026-04-01', status: 'in-progress', order: 2 },
  { id: 'm8', projectId: 'p3', title: 'Reporting Dashboard', description: 'Executive compliance dashboard with real-time alerts', dueDate: '2026-06-15', status: 'planned', order: 3 },
  { id: 'm9', projectId: 'p3', title: 'Audit Certification', description: 'Third-party audit validation', dueDate: '2026-08-30', status: 'planned', order: 4 },
];

export const demoScopeItems: ScopeItem[] = [
  { id: 's1', projectId: 'p1', category: 'Data Engineering', title: 'Data Pipeline Architecture', description: 'Automated ETL from 5 source systems', included: true },
  { id: 's2', projectId: 'p1', category: 'Data Engineering', title: 'Data Quality Framework', description: 'Validation rules and anomaly detection', included: true },
  { id: 's3', projectId: 'p1', category: 'Machine Learning', title: 'Demand Forecasting Models', description: 'Multi-variable prediction models per SKU category', included: true },
  { id: 's4', projectId: 'p1', category: 'Machine Learning', title: 'Anomaly Detection', description: 'Real-time inventory anomaly alerting', included: true },
  { id: 's5', projectId: 'p1', category: 'Integration', title: 'WMS Integration', description: 'Bi-directional sync with warehouse management system', included: true },
  { id: 's6', projectId: 'p1', category: 'Integration', title: 'ERP Connector', description: 'SAP integration for procurement triggers', included: false },
];

export const demoGoals: Goal[] = [
  { id: 'g1', projectId: 'p1', title: 'Reduce Stockout Events', description: 'Minimize lost sales from out-of-stock inventory', type: 'measurable', metric: 'Stockout Rate', target: '< 2% across all SKUs' },
  { id: 'g2', projectId: 'p1', title: 'Optimise Inventory Carrying Costs', description: 'Reduce capital tied up in excess inventory', type: 'measurable', metric: 'Carrying Cost Reduction', target: '15–20% reduction within 6 months' },
  { id: 'g3', projectId: 'p1', title: 'Enable Data-Driven Decision Making', description: 'Empower operations team with predictive insights', type: 'strategic' },
  { id: 'g4', projectId: 'p3', title: 'Achieve Continuous Compliance', description: 'Maintain real-time compliance status across all regulations', type: 'strategic' },
  { id: 'g5', projectId: 'p3', title: 'Reduce Audit Preparation Time', description: 'Automate report generation for audit readiness', type: 'measurable', metric: 'Audit Prep Time', target: '80% reduction' },
];

export const demoChangeRequests: ChangeRequest[] = [
  { id: 'cr1', projectId: 'p1', title: 'Add seasonal trend weighting', description: 'Incorporate seasonal adjustment factors into the forecasting model for improved accuracy during peak periods.', status: 'approved', impact: 'medium', submittedDate: '2026-02-10', resolvedDate: '2026-02-18', budgetImpact: 4500, timelineImpact: '+1 week' },
  { id: 'cr2', projectId: 'p1', title: 'Include 3 additional warehouses', description: 'Expand scope from 9 to 12 warehouse locations for the initial rollout phase.', status: 'approved', impact: 'high', submittedDate: '2026-01-22', resolvedDate: '2026-01-30', budgetImpact: 12000, timelineImpact: '+2 weeks' },
  { id: 'cr3', projectId: 'p1', title: 'Mobile dashboard for warehouse managers', description: 'Add responsive mobile view for real-time inventory insights on the warehouse floor.', status: 'pending', impact: 'medium', submittedDate: '2026-03-05', budgetImpact: 8000, timelineImpact: '+3 weeks' },
  { id: 'cr4', projectId: 'p3', title: 'Add GDPR module', description: 'Extend compliance engine to include GDPR-specific rules and reporting.', status: 'pending', impact: 'high', submittedDate: '2026-03-01', budgetImpact: 15000, timelineImpact: '+4 weeks' },
];

export const demoBudgets: BudgetRecord[] = [
  { id: 'b1', projectId: 'p1', totalBudget: 185000, spent: 112500, remaining: 72500, stages: [
    { id: 'bs1', name: 'Discovery & Planning', amount: 25000, status: 'paid' },
    { id: 'bs2', name: 'Model Development', amount: 45000, status: 'paid' },
    { id: 'bs3', name: 'Platform Build', amount: 42500, status: 'invoiced' },
    { id: 'bs4', name: 'Integration & Testing', amount: 40000, status: 'upcoming' },
    { id: 'bs5', name: 'Launch & Optimisation', amount: 32500, status: 'upcoming' },
  ]},
  { id: 'b2', projectId: 'p3', totalBudget: 140000, spent: 48000, remaining: 92000, stages: [
    { id: 'bs6', name: 'Framework & Planning', amount: 20000, status: 'paid' },
    { id: 'bs7', name: 'Engine Development', amount: 28000, status: 'paid' },
    { id: 'bs8', name: 'Dashboard Build', amount: 35000, status: 'upcoming' },
    { id: 'bs9', name: 'Testing & Certification', amount: 32000, status: 'upcoming' },
    { id: 'bs10', name: 'Deployment', amount: 25000, status: 'upcoming' },
  ]},
];

export const demoCommunications: CommunicationUpdate[] = [
  { id: 'cu1', projectId: 'p1', title: 'Sprint 8 Complete — Integration Underway', content: 'The ML models have been successfully validated against 18 months of historical data with 94.2% accuracy. We\'re now moving into the integration phase, connecting the forecasting engine to the warehouse management systems. Next sync scheduled for March 20.', author: 'Alex Morgan', date: '2026-03-12', type: 'update' },
  { id: 'cu2', projectId: 'p1', title: 'Model Accuracy Milestone Achieved', content: 'Our forecasting models have exceeded the target accuracy threshold across all SKU categories. The team recommends proceeding to production integration.', author: 'Alex Morgan', date: '2026-02-28', type: 'milestone' },
  { id: 'cu3', projectId: 'p1', title: 'Quarterly Review Meeting Notes', content: 'Reviewed project progress with the NexaCore leadership team. All stakeholders aligned on current trajectory. Budget tracking within 3% of plan. Agreed to proceed with the expanded warehouse scope.', author: 'Alex Morgan', date: '2026-02-15', type: 'meeting' },
  { id: 'cu4', projectId: 'p1', title: 'Change Request Approved — Warehouse Expansion', content: 'The request to include 3 additional warehouses in the initial rollout has been approved. Adjusted timeline and budget accordingly.', author: 'Alex Morgan', date: '2026-01-30', type: 'decision' },
  { id: 'cu5', projectId: 'p3', title: 'Rule Engine Alpha Build Complete', content: 'The first build of the compliance rule engine is operational, covering SOX and PCI-DSS frameworks. Moving into testing phase with synthetic audit scenarios.', author: 'Alex Morgan', date: '2026-03-08', type: 'update' },
  { id: 'cu6', projectId: 'p3', title: 'Delayed: Third-Party API Integration', content: 'The regulatory data feed provider has delayed their API update. This may impact our timeline for the automated alerting module. Working on mitigation plan.', author: 'Alex Morgan', date: '2026-02-20', type: 'update' },
];
