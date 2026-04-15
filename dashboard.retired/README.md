# Command Center — RETIRED

**Retired:** 2026-04-15

This custom Next.js dashboard was the "Command Center" that ran at `localhost:3000` and provided a live view of the OpenClaw gateway (agents, dispatch board, 2Brain wiki, costs, decisions, memory ops).

It has been retired in favor of:

| Feature | Replacement |
|---|---|
| Task dispatch, approvals, boards | **Mission Control** (`http://localhost:3100`) — purpose-built OpenClaw work orchestration platform |
| Agent fleet, sessions, skills, cron | **OpenClaw Control UI** (`openclaw dashboard` → `http://localhost:18789`) |
| 2Brain wiki + briefings viewer | **2brain-viewer** (`http://localhost:3200/wiki`) — minimal read-only Next.js app |
| Decision log | Mission Control "Decisions" board, synced every 5 min by `sync-decisions.sh` |
| Security audit findings | Mission Control "Approvals" board, pushed by the security audit cron |

## Why retire?

- Duplicated functionality already in Mission Control and OpenClaw Control UI
- Drifted from OpenClaw goals (custom dispatch board, custom approval flow)
- Two dashboards created friction
- Mission Control's task/approval model is a better fit for human-in-the-loop workflows

## Data migration

No data was lost:
- Decision log rows are synced to Mission Control on a 5-minute cron (see `OpenClawMaster/tools/scripts/sync-decisions.sh`)
- 2Brain wiki articles are still rendered at `localhost:3200/wiki`
- Gateway telemetry, agent health, and session state are shown in OpenClaw Control UI

## How to read historical code

This directory is preserved in git history. If you need to reference the old approach to a feature (e.g., how the dispatch board merged gateway tasks with local approval tasks), the code is still here — just don't run it.

To archive permanently and reduce repo size, delete this directory and rely on git history: `git rm -r dashboard.retired`.
