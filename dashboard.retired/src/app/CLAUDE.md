# src/app/ — Page Layer (Next.js App Router)

> Scoped context for the ClawCode Command Center dashboard pages.

## Conventions

- **Server Components by default.** Only add `"use client"` when interactivity is required (event handlers, useState, useEffect). All current pages are Server Components.
- **`export const dynamic = "force-dynamic"`** on every page and API route. The dashboard reads live state from the filesystem and gateway — nothing should be cached.
- **UI components from shadcn/ui** — `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Table`, `Button`, `Tabs`, `ScrollArea`, `Separator`. Located in `src/components/ui/`.
- **Custom components** in `src/components/` — `left-nav.tsx` (icon-only 52px sidebar), `ticker-bar.tsx` (top status bar), `agent-card.tsx`, `kanban-board.tsx`, etc.
- **Navigation uses `next/link`** — import `Link` from `next/link` for all internal navigation.
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, plugins added with `@plugin`. Typography plugin is active for prose rendering.
- **Color palette** — slate for neutral, indigo for primary accents, emerald for positive, rose for negative, amber for warnings. Font: Geist + Geist Mono.
- **Page pattern** — each page reads data in the Server Component body (no `getServerSideProps`), wraps in `<div className="p-4 lg:p-6 space-y-6">`, uses stat cards + detail lists.

## Current Routes

| Route | Page | Data Source |
|-------|------|-------------|
| `/` | Home dashboard | Gateway health + telemetry |
| `/agents` | Agent fleet | Gateway health + telemetry |
| `/costs` | Token usage & spend | Gateway `usage.cost` |
| `/memory` | Memory operations log | SQLite `memory_ops_log` |
| `/decisions` | Decision log | `state/Decision_Log.md` |
| `/brain` | 2Brain Intelligence | Filesystem: `wiki/`, `briefings/archive/` |
| `/brain/wiki/[slug]` | Wiki article viewer | Filesystem: `wiki/[slug].md` |
| `/brain/briefings/[date]` | Briefing detail | Filesystem: `briefings/archive/[date].json` |
| `/workflows` | Workflow viewer | `config/workflows.yaml` |

## Adding a New Page

1. Create `src/app/<route>/page.tsx` as a Server Component
2. Add data fetching function to `src/lib/state.ts` (with input validation if URL params are involved)
3. Add navigation entry to `src/components/left-nav.tsx` NAV_ITEMS array
4. Use `force-dynamic`, existing UI components, and the standard page layout pattern
