# Cursor Rules for Website Analyzer Pro

## Project Overview
This is a college project for analyzing websites - checking SEO, performance, accessibility, and providing AI-powered insights.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion / Motion
- **State Management:** Zustand
- **Charts:** Recharts
- **Real-time:** Socket.io-client

## Code Style Guidelines

### TypeScript
- Use strict TypeScript - no `any` types
- Define interfaces for all data structures in `/types/index.ts`
- Use type imports: `import type { Website } from "@/types"`

### React/Next.js
- Use functional components with hooks
- Mark client components with `"use client"` directive
- Use Next.js App Router conventions
- Prefer server components when possible

### File Naming
- Components: PascalCase (`ChatInterface.tsx`)
- Hooks: camelCase with `use` prefix (`useCrawl.ts`)
- Utilities: camelCase (`crawler.ts`)
- Types: PascalCase for interfaces, camelCase for type aliases

### Component Structure
```tsx
"use client"; // if needed

import { useState } from "react";
import { Component } from "@/components/ui/component";
import type { SomeType } from "@/types";

interface ComponentProps {
  prop: string;
}

export function ComponentName({ prop }: ComponentProps) {
  // hooks
  // handlers
  // render
}
```

### State Management
- Use Zustand stores in `/lib/store.ts`
- Keep stores focused and small
- Use persist middleware for data that should survive refresh

### API Calls
- Use the API client in `/lib/api.ts`
- Handle errors explicitly
- Show loading states

### Styling
- Use Tailwind CSS classes
- Use shadcn/ui components from `/components/ui/`
- Follow dark theme as default
- Use CSS variables for theming

## Folder Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   └── dashboard/      # Dashboard pages
├── components/
│   ├── chat/           # Chat-related components
│   ├── dashboard/      # Dashboard tabs and layout
│   ├── shared/         # Shared components (Header, etc.)
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions
```

## Common Patterns

### Adding a new API endpoint
1. Create route in `/app/api/[endpoint]/route.ts`
2. Add types in `/types/index.ts`
3. Add API method in `/lib/api.ts`
4. Create hook in `/hooks/` if needed

### Adding a new dashboard tab
1. Create component in `/components/dashboard/[Tab]Tab.tsx`
2. Add to tabs list in `/app/dashboard/[website-id]/page.tsx`
3. Add any required types

### Adding a new shadcn component
```bash
npx shadcn@latest add [component-name]
```

## Remember
- This is a COLLEGE PROJECT - keep it simple
- Focus on core functionality
- Use mock data where backend isn't ready
- Document complex logic with comments

