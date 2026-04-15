# Command Center Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the OpenClaw Command Center from a dark static dashboard to a light, multi-page NOC-style operational interface with Kanban dispatch board, agent telemetry, and drill-down pages.

**Architecture:** Next.js 16 App Router with shared layout (ticker bar + left nav), SQLite-backed task API for the Kanban, server components for data fetching, client components only where interactivity is needed (framer-motion animations). All existing data sources remain — new `tasks` table added to SQLite.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Framer Motion, Recharts, better-sqlite3, Lucide React, Geist fonts

**Spec:** `docs/superpowers/specs/2026-04-12-command-center-redesign.md`

---

## File Structure

### New Files
```
src/app/layout.tsx                    — rewrite: ticker bar, left nav, footer, light theme
src/app/page.tsx                      — rewrite: command cards + active specialists + kanban
src/app/agents/page.tsx               — new: full fleet telemetry
src/app/costs/page.tsx                — new: cost charts + table
src/app/memory/page.tsx               — new: memory ops timeline
src/app/decisions/page.tsx            — new: decision log table
src/app/brain/page.tsx                — new: 2Brain stats
src/app/workflows/page.tsx            — new: workflow cards + cron
src/app/api/tasks/route.ts            — new: GET + POST tasks
src/app/api/tasks/[id]/route.ts       — new: PATCH task by id
src/components/ticker-bar.tsx         — new: status ticker
src/components/left-nav.tsx           — new: icon sidebar
src/components/command-cards.tsx      — new: Milo + Elon cards with telemetry
src/components/active-specialists.tsx — new: working agents strip
src/components/kanban-board.tsx       — new: dispatch board
src/components/agent-fleet.tsx        — new: agents page grouped view
src/components/agent-card.tsx         — new: shared reusable card
src/lib/tasks.ts                      — new: task CRUD functions
src/lib/telemetry.ts                  — new: agent telemetry aggregation
```

### Files to Modify
```
src/lib/sqlite.ts                     — add read-write getDbRW(), tasks init
src/app/globals.css                   — replace dark theme with light NOC
```

### Files to Remove (after all new components are wired)
```
src/components/pipeline-view.tsx
src/components/agent-roster.tsx
src/components/system-health.tsx
src/components/channel-status.tsx
src/components/cost-tracker.tsx
src/components/memory-feed.tsx
src/components/decision-log.tsx
src/components/brain-stats.tsx
src/components/workflow-monitor.tsx
src/lib/pipeline.ts
```

---

## Task 1: Theme + Global Styles

Update globals.css from dark to light NOC theme with glow utilities. See spec for exact color tokens. Key changes: slate-50 background, white cards, indigo-500 accent, status glow utilities (glow-indigo, glow-emerald, glow-amber, glow-rose, glow-sky).

**Files:** Modify `src/app/globals.css`
**Commit:** `feat: replace dark theme with light NOC theme variables and glow utilities`

## Task 2: Layout Shell — Ticker Bar + Left Nav

Create TickerBar (compact status strip: gateway, ollama, disk, channels) and LeftNav (52px icon sidebar with 7 routes). Rewrite layout.tsx: remove dark class from html, set body to bg-slate-50, add ticker/nav/main/footer structure. Data fetching for ticker moves from page.tsx to layout.tsx.

**Files:** Create `src/components/ticker-bar.tsx`, `src/components/left-nav.tsx`. Rewrite `src/app/layout.tsx`
**Commit:** `feat: add layout shell — ticker bar, left nav, light theme body`

## Task 3: SQLite Tasks Table + API Routes

Add getDbRW() to sqlite.ts (read-write, creates tasks table on init). Create tasks.ts with getTasks/createTask/updateTask. Create telemetry.ts with getAgentTelemetry24h (aggregates cost_tracker for 24h window). Create API routes: GET+POST /api/tasks, PATCH /api/tasks/[id].

**Files:** Modify `src/lib/sqlite.ts`. Create `src/lib/tasks.ts`, `src/lib/telemetry.ts`, `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`
**Commit:** `feat: add tasks table, CRUD API, and agent telemetry queries`

## Task 4: Home Page — Command Cards + Active Specialists + Kanban

Create CommandCards (Milo + Elon with 4-metric telemetry grid), ActiveSpecialists (horizontal strip, only when agents working), KanbanBoard (5-lane dispatch board reading from tasks table). Rewrite page.tsx to compose these three sections.

**Files:** Create `src/components/command-cards.tsx`, `src/components/active-specialists.tsx`, `src/components/kanban-board.tsx`. Rewrite `src/app/page.tsx`
**Commit:** `feat: home page with command cards, active specialists, kanban board`

## Task 5: Agents Page

Create AgentCard (shared, supports full and compact modes) and AgentFleet (groups by layer, active agents get full cards, inactive specialists collapse to chips). Create agents/page.tsx merging roster + telemetry + active tasks.

**Files:** Create `src/components/agent-card.tsx`, `src/components/agent-fleet.tsx`, `src/app/agents/page.tsx`
**Commit:** `feat: agents page with fleet telemetry, grouped by layer`

## Task 6: Drill-Down Pages

Create 5 pages, each reading from existing data sources:
- costs/page.tsx — summary cards + table from queryRecentCostsByAgent()
- memory/page.tsx — timeline feed from queryMemoryOps()
- decisions/page.tsx — table from getDecisionLog()
- brain/page.tsx — stats cards from getBrainStats()
- workflows/page.tsx — workflow cards from getWorkflows()

**Files:** Create 5 page.tsx files under src/app/
**Commit:** `feat: add drill-down pages — costs, memory, decisions, 2Brain, workflows`

## Task 7: Cleanup — Remove Old Components

Delete the 9 old components and pipeline.ts. Verify clean build with no broken imports.

**Files:** Delete 10 files (see file structure above)
**Commit:** `chore: remove old dashboard components replaced by redesign`

## Task 8: Update Elon Persona — Local Tasks API

Replace the Monday.com task board section in agents/Elon.md with local Command Center API reference (POST/PATCH /api/tasks). Update key rules reference from "Monday.com" to "Command Center Task Board via API".

**Files:** Modify `agents/Elon.md` in OpenClawMaster repo
**Commit:** `feat: switch Elon task board from Monday.com to local Command Center API`

## Task 9: Final Verification

Full build verification, visual walkthrough of all 7 pages, API test (create task via curl, verify it appears on Kanban), push both repos.

---

> **Detailed code for each task** is available in the spec and the brainstorming mockups. The implementing agent should read the spec at `docs/superpowers/specs/2026-04-12-command-center-redesign.md` and follow the component patterns established in the mockups. Each component uses shadcn Card/Badge/Table, framer-motion for animations, Tailwind for styling on the slate-50 light theme. Server components for data fetching, "use client" only for framer-motion interactivity.
