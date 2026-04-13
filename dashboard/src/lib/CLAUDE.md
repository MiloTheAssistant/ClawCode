# src/lib/ — Data Layer

> Scoped context for the ClawCode Command Center dashboard data layer.

## What Lives Here

| File | Purpose |
|------|---------|
| `config.ts` | Central config — paths to 2Brain, OpenClawMaster, SQLite, gateway URL, Ollama URL |
| `state.ts` | File-system readers for Decision Log, Active Projects, 2Brain wiki/briefings |
| `sqlite.ts` | SQLite access (read-only `getDb()`, read-write `getDbRW()` for tasks table) |
| `telemetry.ts` | Agent telemetry via `openclaw gateway call` CLI — token counts, session counts |

## Conventions

- **Gateway CLI calls use `execFileSync` with array args** — no shell interpretation, no injection risk. Pattern:
  ```typescript
  execFileSync("openclaw", ["gateway", "call", method, "--json"], {
    timeout: 8_000,
    env: { ...process.env, NO_COLOR: "1" },
    stdio: ["ignore", "pipe", "ignore"],
  })
  ```
- **Parse JSON from gateway output carefully.** Gateway may emit config warnings before JSON. Find the first `{` or `[` character and parse from there.
- **Path traversal prevention.** Any function accepting a slug or ID parameter from URL params must validate with a regex before constructing file paths (e.g., `/^[a-z0-9-]+$/` for wiki slugs, `/^\d{4}-\d{2}-\d{2}$/` for briefing dates).
- **Config paths** are centralized in `config.ts`. Never hardcode paths — always reference `config.twobrain.root`, `config.openclawMaster.root`, etc.
- **SQLite is optional.** Both `getDb()` and `getDbRW()` return `null` when the database file doesn't exist or `better-sqlite3` isn't available. Always handle the null case.
- **Milo is male** — use he/him in any code comments referencing Milo.
