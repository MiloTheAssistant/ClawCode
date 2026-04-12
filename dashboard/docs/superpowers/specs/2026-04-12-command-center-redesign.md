# Command Center Dashboard Redesign

**Date:** 2026-04-12
**Status:** Design approved, pending implementation plan

## Summary

Full redesign of the OpenClaw Command Center dashboard from a dark, static monitoring page to a light, multi-page NOC-style operational interface. Adds a Kanban dispatch board as the primary view, agent telemetry, and drill-down pages for secondary data. Backed by local SQLite — no external dependencies.

## Goals

1. Real-time dispatch visibility: who has the ball, what stage, which model
2. Agent telemetry: tokens, think time, cost, sessions (24h rolling)
3. Clean NOC aesthetic: light theme, high-contrast data, minimal chrome
4. Drill-down navigation: secondary data moves off the main page into dedicated routes
5. Vercel-ready: deployable to production in the next phase

## Architecture

### Layout Shell

```
┌─────────────────────────────────────────────────┐
│  Status Ticker Bar (full width, 36px)            │
├────────┬────────────────────────────────────────┤
│  Left  │                                        │
│  Nav   │   Main Content (per route)             │
│  52px  │                                        │
├────────┴────────────────────────────────────────┤
│  Footer (version, date)                          │
└─────────────────────────────────────────────────┘
```

**App Router structure:**
```
src/app/
  layout.tsx          — shell: ticker bar, left nav, footer
  page.tsx            — home: command cards + kanban
  agents/page.tsx     — full fleet telemetry
  costs/page.tsx      — cost tracker charts + table
  memory/page.tsx     — memory ops timeline
  decisions/page.tsx  — decision log table
  brain/page.tsx      — 2Brain stats + article list
  workflows/page.tsx  — workflow cards + cron status
```

### Theme: 22nd Century NOC

- **Background:** `slate-50` (#f8fafc)
- **Cards:** white, `border-slate-200`, subtle shadow (`shadow-sm`)
- **Accent:** indigo-500 (#6366f1) — brand color
- **Status colors:**
  - Healthy/complete: emerald-500
  - Working/active: sky-600 with subtle glow
  - Approval/review: violet-600
  - Stuck/error: rose-600
  - Idle: slate-400
- **Typography:** Geist Sans (UI), Geist Mono (data values)
- **Active indicators:** subtle box-shadow glow on status dots
- **Idle agents:** 70% opacity, expand to full on activation

### Status Ticker Bar

Pinned to top of every page. Compact horizontal strip.

**Contents:** Gateway status, Ollama model count, Disk usage, Telegram status, Discord status, Email/MCP status, version badge.

**Data sources:** `getGatewayHealth()`, `getOllamaStatus()`, `getDiskSpace()`, `getChannels()` — all existing functions.

**Visual:** `bg-slate-100`, monospace values, green/red dots, pipe separators. 36px tall.

### Left Navigation

Icon-only sidebar, 52px wide. Active page highlighted with `bg-indigo-50` background.

**Items:**
| Icon | Label | Route |
|------|-------|-------|
| 🏠 | Home | `/` |
| 🤖 | Agents | `/agents` |
| 💰 | Costs | `/costs` |
| 🧠 | Memory | `/memory` |
| 📋 | Decisions | `/decisions` |
| 📚 | 2Brain | `/brain` |
| ⚙️ | Workflows | `/workflows` |

Icons rendered via Lucide React (not emoji — mockups used emoji for clarity).

## Pages

### Home (`/`)

The operational nerve center. Three sections, top to bottom:

**1. Command Agent Cards (Milo + Elon)**

Two side-by-side cards, always visible. Each shows:
- Agent name + color dot (with glow when active)
- Role description
- Model + provider (monospace)
- Status badge: IDLE (green), WORKING (blue, pulsing), ERROR (red)
- 4-metric telemetry grid:
  - Tokens (24h): total with ↑input ↓output breakdown
  - Think Time: cumulative active processing time today
  - Est. Cost (24h): calculated from model pricing in openclaw.json
  - Dispatched/Agents Used: tasks sent (Milo) or agents coordinated (Elon)
- Footer: last active timestamp, current task if working

**2. Active Specialists Strip**

Horizontal row of compact cards — only appears when specialists are actively working. Each shows:
- Agent name + color dot (glowing)
- Model + current task name
- Live token count + elapsed time
- Left border accent in sky-600

When no specialists are active, this section is hidden.

**3. Kanban Dispatch Board**

Full-width card with 5 lanes:

| Lane | Color | Meaning |
|------|-------|---------|
| Not Started | slate-200 | Queued, not yet picked up |
| Working | sky-600 | Agent actively processing |
| Approval | violet-600 | Sentinel QA or Milo review |
| Stuck | rose-600 | HALT, error, or blocked |
| Complete | emerald-600 | Delivered to John |

**Kanban card contents:**
- Task name (bold)
- Dispatch chain: `Elon → Cerberus` (who dispatched → who holds it)
- Model being used (monospace, small)
- Time estimate or elapsed time
- Priority badge (HIGH amber, MED indigo, LOW slate)

**Header:** "Dispatch Board" with summary: "3 active · 1 stuck · 2 complete today"

**Complete lane:** Cards fade to 75% opacity. Only show last 24h, older auto-archive.

### Agents (`/agents`)

Full fleet view, grouped by layer (Command → Governance → Specialist).

**Active agents:** Full telemetry cards (same layout as command cards on home) with 4-metric grid, role description, model, status, last active, current task.

**Idle agents with recent 24h activity:** Full cards at 70% opacity.

**Inactive specialists (no 24h activity):** Collapse to compact chips showing name + color dot + "0 tok" — expand to full cards when activated.

**Page header:** "Agents" with summary: "17 agents · 3 active now" and 24h totals (tokens, cost).

### Costs (`/costs`)

- **Summary cards:** Total spend (24h), Total spend (30d), Top agent by cost, Average cost per token
- **Bar chart:** Daily spend by agent, last 30 days (Recharts)
- **Table:** Agent, model, provider, tokens in, tokens out, estimated cost, timestamp
- **Filters:** Agent dropdown, date range picker, provider dropdown
- **Data source:** SQLite `cost_tracker` table via existing `queryCosts()` and `queryRecentCostsByAgent()`

### Memory (`/memory`)

- **Timeline feed:** Chronological list of memory operations
- **Each entry:** Timestamp, agent, operation type (read/write/search), query, result count, content preview
- **Filters:** Agent, operation type, date range
- **Data source:** SQLite `memory_ops_log` table via existing `queryMemoryOps()`

### Decisions (`/decisions`)

- **Searchable table:** ID, date, decision, made by, context
- **Sort by:** Date (default desc), made by
- **Search:** Full-text across decision and context fields
- **Data source:** `state/Decision_Log.md` via existing `getDecisionLog()`

### 2Brain (`/brain`)

- **Stats cards:** Wiki articles count, Raw sources count, Briefings count, Last briefing date, Last wiki update
- **Briefings list:** Recent briefings from archive directory with dates
- **Wiki articles list:** Article names from wiki directory
- **Data source:** File system scanning via existing `getBrainStats()`

### Workflows (`/workflows`)

- **Card per workflow** from `state/workflows.json`
- **Each card:** Name, schedule, status badge (active/paused/error), last run date, assigned agents list, router profile
- **Cron job status** merged from `.openclaw/cron/jobs.json`: next run, last run status, consecutive errors
- **Data sources:** `getWorkflows()` + new `getCronJobs()` function

## Data Layer

### New SQLite Table: `tasks`

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_agent TEXT,
  dispatched_by TEXT,
  router_profile TEXT,
  model TEXT,
  complexity INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
```

**Valid statuses:** `not_started`, `working`, `approval`, `stuck`, `complete`
**Valid priorities:** `low`, `medium`, `high`

### New API Routes

**`POST /api/tasks`** — Create a task (Elon calls this)
```json
{
  "title": "Fix cron job",
  "description": "Telegram delivery failing, chatId missing",
  "status": "working",
  "priority": "high",
  "assigned_agent": "Elon",
  "dispatched_by": "Milo",
  "router_profile": "Engineering",
  "model": "gpt-5.4",
  "complexity": 3
}
```

**`PATCH /api/tasks/:id`** — Update task status/assignment
```json
{
  "status": "approval",
  "assigned_agent": "Sentinel"
}
```

**`GET /api/tasks`** — List tasks (dashboard reads this)
- Query params: `status`, `assigned_agent`, `since` (ISO date)

### Existing Data Sources (unchanged)

- `getGatewayHealth()` — gateway status
- `getOllamaStatus()`, `getRunningModels()` — Ollama
- `getDiskSpace()` — disk
- `getChannels()` — Telegram, Discord, Email
- `getAgentRoster()` — agent list from openclaw.json
- `getWorkflows()` — from state/workflows.json
- `getDecisionLog()` — from state/Decision_Log.md
- `getBrainStats()` — file system counts
- `queryCosts()`, `queryRecentCostsByAgent()` — cost data
- `queryMemoryOps()` — memory operations

### Agent Telemetry

Telemetry data (tokens, think time, cost, sessions) comes from the existing `cost_tracker` SQLite table, aggregated per agent for the 24h window. The `queryRecentCostsByAgent()` function already does this — extend it to also return token breakdowns and session counts.

**Think Time definition:** Cumulative wall-clock time the agent spent processing requests in the 24h window. Derived from session duration records in `cost_tracker` (sum of per-request durations). Displayed as `Xm` or `Xh Ym`.

## Components to Create

| Component | Route | Replaces |
|-----------|-------|----------|
| `TickerBar` | layout.tsx | Header |
| `LeftNav` | layout.tsx | — |
| `CommandCards` | `/` | AgentRoster (partial) |
| `ActiveSpecialists` | `/` | — |
| `KanbanBoard` | `/` | PipelineView |
| `AgentFleet` | `/agents` | AgentRoster |
| `AgentCard` | shared | — |
| `CostDashboard` | `/costs` | CostTracker |
| `MemoryTimeline` | `/memory` | MemoryFeed |
| `DecisionTable` | `/decisions` | DecisionLog |
| `BrainOverview` | `/brain` | BrainStats |
| `WorkflowCards` | `/workflows` | WorkflowMonitor |

## Components to Remove

- `PipelineView` — replaced by KanbanBoard
- `AgentRoster` — replaced by CommandCards (home) + AgentFleet (agents page)
- `SystemHealth` — absorbed into TickerBar
- `ChannelStatus` — absorbed into TickerBar
- Old home page layout with 3x3 grid

## Migration Notes

- SQLite database adds `tasks` table alongside existing `cost_tracker` and `memory_ops_log`
- Database connection changes from read-only to read-write for the tasks API
- Existing API routes (`/api/agents`, `/api/costs`, `/api/health`, `/api/memory`) remain unchanged
- `force-dynamic` stays on all pages — no static generation for operational data
- Elon's persona already references Monday.com — update to use local `/api/tasks` endpoint instead

## Out of Scope

- Drag-and-drop Kanban (read-only for now, agents drive state)
- Real-time WebSocket updates (polling via Next.js revalidation is sufficient)
- Dark mode toggle (light NOC theme only for v1)
- Monday.com integration (replaced by local SQLite)
- Mobile-responsive layout (desktop NOC first)
