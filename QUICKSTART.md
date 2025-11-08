# QAssist - Quick Start Guide

Get your QAssist development environment up and running in 5 minutes.

## Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Git** version control
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required dependencies including Next.js 15, React 19, Supabase, and Tailwind CSS.

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and update the following variables:

### Required Variables

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**How to get Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** and **anon key**

### Optional Variables (configure later)

These are needed for full functionality but not required to start:

```bash
# Jira Integration (for User Story sync)
JIRA_CLIENT_ID=your-jira-oauth-client-id
JIRA_CLIENT_SECRET=your-jira-oauth-client-secret

# Stripe (for subscription payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 3: Set Up Supabase Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the migration scripts (to be created):

```sql
-- User table will be created by Supabase Auth automatically
-- You'll add custom tables in the next phase
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Step 5: Verify Installation

Open your browser and visit:

- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Projects**: http://localhost:3000/projects

You should see the QAssist UI with all pages loading correctly.

## Project Structure Overview

```
qassist/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages (login, signup)
│   │   ├── (dashboard)/    # Dashboard pages (projects, test-cases)
│   │   └── api/            # API routes
│   ├── components/         # React components
│   │   ├── layout/         # Header, Sidebar
│   │   ├── ui/             # Reusable UI components
│   │   └── features/       # Feature-specific components
│   ├── lib/                # Utilities (Supabase client, helpers)
│   ├── types/              # TypeScript types
│   └── styles/             # Global CSS
├── .context/               # AI-driven development documentation
├── .prompts/               # AI prompt templates
└── docs/                   # Project documentation
```

## Next Steps

### Phase 1: Authentication (Recommended First)

1. Implement Supabase authentication
2. Create user registration flow
3. Add login/logout functionality
4. Protected routes

**Relevant Documentation:**
- `.context/PBI/epics/EPIC-QASSIST-001-user-auth/`
- Supabase Auth docs: https://supabase.com/docs/guides/auth

### Phase 2: Core Features

1. **Projects Management** (EPIC-001)
2. **Jira Integration** (EPIC-002)
3. **Test Case Editor** (EPIC-003)
4. **Evidence Management** (EPIC-004)

**Relevant Documentation:**
- `.context/PRD/` - Product requirements
- `.context/SRS/` - Software requirements
- `.context/PBI/` - Product backlog items

### Phase 3: Advanced Features

- Offline mode (local-first storage)
- PDF exports
- Subscription management

## Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Production build
npm run build
npm run start
```

## Troubleshooting

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Supabase connection errors

1. Verify your `.env.local` has correct values
2. Check Supabase project is active (not paused)
3. Ensure firewall allows outbound HTTPS connections

### TypeScript errors

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run dev
```

### Module not found errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- **Documentation**: `docs/` directory
- **AI Development Guide**: `.context/README.md`
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/qassist/issues)

## Ready to Code?

Start with the authentication flow:

```bash
# Read the implementation plan
cat .context/PBI/epics/EPIC-QASSIST-001-user-auth/epic.md

# Review user stories
ls .context/PBI/epics/EPIC-QASSIST-001-user-auth/stories/
```

Good luck building QAssist! 🚀
