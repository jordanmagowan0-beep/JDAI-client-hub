# JDAI Solutions — Client Portal

Secure client portal for JDAI Solutions. Access your project dashboard, milestones, budgets, and updates.

## Tech Stack
- React + Vite
- Tailwind CSS
- shadcn/ui
- Supabase

## Environment Variables
The frontend reads Supabase configuration from Vite environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Only the project URL and publishable key belong in the frontend. Do not expose a service role key or a direct database connection string.

## Setup
```bash
npm install
npm run dev
```

## Data Sources
All portal data is loaded from Supabase:

- `clients`
- `profiles`
- `projects`
- `project_milestones`
- `project_scope_items`
- `project_goals`
- `change_requests`
- `project_budget_items`
- `project_updates`
