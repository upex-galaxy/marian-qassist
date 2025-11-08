# QAssist - Source Code Structure

This directory contains the Next.js 15 application source code using the App Router pattern.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group for authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   └── layout.tsx     # Auth layout (centered card)
│   ├── (dashboard)/       # Route group for authenticated pages
│   │   ├── projects/      # Projects management
│   │   ├── test-cases/    # Test case management
│   │   ├── settings/      # User settings
│   │   └── layout.tsx     # Dashboard layout (sidebar + header)
│   ├── api/              # API routes (Server Actions)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
│
├── components/            # React components
│   ├── ui/               # Reusable UI components (buttons, inputs, etc.)
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components (Header, Sidebar, Footer)
│
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions (cn, formatDate, etc.)
│
├── types/                # TypeScript type definitions
│   └── index.ts          # Core types (User, Project, TestCase, etc.)
│
├── hooks/                # Custom React hooks
│
├── utils/                # Helper functions
│
└── styles/               # Global styles
    └── globals.css       # Tailwind CSS + CSS variables
```

## Key Features

### App Router (Next.js 15)
- **Route Groups**: `(auth)` and `(dashboard)` for shared layouts
- **Server Components**: Default for all components (faster, smaller bundle)
- **Client Components**: Use `'use client'` directive when needed (interactivity)
- **Server Actions**: API routes in `app/api/` for backend logic

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/components`, `@/lib`, etc.)
- Type safety across the entire application

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Theme colors defined in `globals.css`
- **cn() utility**: Merge Tailwind classes with clsx + tailwind-merge

### State Management
- **Zustand**: Lightweight state management (installed)
- **React Hook Form**: Form handling with validation (installed)
- **Zod**: Schema validation (installed)

### Authentication & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication (email/password, OAuth)
  - File storage
  - Real-time subscriptions

### External Integrations
- **Jira API**: OAuth 2.0 integration for User Story sync
- **Stripe**: Payment processing and subscription management

## Development Workflow

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

### Production Build
```bash
npm run build
npm run start
```

## File Naming Conventions

- **Pages**: `page.tsx` (required by Next.js App Router)
- **Layouts**: `layout.tsx` (required by Next.js App Router)
- **Components**: PascalCase (e.g., `Button.tsx`, `UserCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **Types**: PascalCase for interfaces (e.g., `User`, `Project`)

## Code Organization Best Practices

### Component Structure
```tsx
'use client'; // Only if needed (interactivity, hooks, etc.)

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return <div>...</div>;
}
```

### Server Actions (API Routes)
```ts
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // API logic
  return NextResponse.json({ data });
}
```

### Custom Hooks
```ts
// hooks/useProjects.ts
import { useState, useEffect } from 'react';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  // Hook logic
  return { projects };
}
```

## Environment Variables

See `.env.example` for required environment variables. Copy to `.env.local`:

```bash
cp .env.example .env.local
```

**Never commit `.env.local` to git!**

## Next Steps

1. Set up Supabase project and add credentials to `.env.local`
2. Configure Jira OAuth application
3. Set up Stripe account for payment processing
4. Implement authentication flow
5. Build core features (Projects, Test Cases, Jira Sync)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
