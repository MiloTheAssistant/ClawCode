import { getDbRW } from "./sqlite";
import { existsSync } from "fs";

const VALID_STATUSES = [
  "not_started",
  "working",
  "approval",
  "stuck",
  "complete",
] as const;
const VALID_PRIORITIES = ["low", "medium", "high"] as const;

const GATEWAY_RUNS_DB =
  process.env.GATEWAY_RUNS_DB ||
  "/Volumes/BotCentral/Users/milo/.openclaw/tasks/runs.sqlite";

// Map gateway task_runs.status to kanban lane status
function mapGatewayStatus(status: string): TaskStatus {
  switch (status) {
    case "queued":
      return "not_started";
    case "running":
      return "working";
    case "succeeded":
      return "complete";
    case "failed":
    case "cancelled":
    case "timed_out":
      return "stuck";
    default:
      return "not_started";
  }
}

// Map gateway task_runs.runtime to priority
function mapPriority(runtime: string): TaskPriority {
  if (runtime === "cli") return "high";
  if (runtime === "subagent") return "medium";
  return "low";
}

/**
 * Read task runs from the gateway's runs.sqlite (the real dispatch data).
 * Falls back to the 2Brain tasks table if gateway DB is unavailable.
 */
export function getGatewayTasks(limit = 50): Task[] {
  if (!existsSync(GATEWAY_RUNS_DB)) return [];
  try {
    const Database = require("better-sqlite3");
    const db = new Database(GATEWAY_RUNS_DB, { readonly: true });
    const rows = db
      .prepare(
        `SELECT task_id, runtime, agent_id, label, task, status,
                created_at, started_at, ended_at, error,
                progress_summary, terminal_summary, owner_key
         FROM task_runs
         WHERE runtime IN ('subagent', 'cli', 'automation')
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .all(limit) as Array<{
      task_id: string;
      runtime: string;
      agent_id: string | null;
      label: string | null;
      task: string | null;
      status: string;
      created_at: number;
      started_at: number | null;
      ended_at: number | null;
      error: string | null;
      progress_summary: string | null;
      terminal_summary: string | null;
      owner_key: string | null;
    }>;
    db.close();

    return rows.map((r, i) => {
      // Extract agent from owner_key like "agent:main:main" → "main"
      const ownerParts = (r.owner_key || "").split(":");
      const dispatchedBy = ownerParts[1] || null;
      // Title: use label, first 80 chars of task, or task_id
      const title =
        r.label || (r.task ? r.task.slice(0, 80) : r.task_id.slice(0, 8));

      return {
        id: i + 1,
        title,
        description: r.terminal_summary || r.progress_summary || r.error || null,
        status: mapGatewayStatus(r.status),
        priority: mapPriority(r.runtime),
        assigned_agent: r.agent_id,
        dispatched_by: dispatchedBy,
        router_profile: r.runtime,
        model: null,
        complexity: null,
        created_at: new Date(r.created_at).toISOString(),
        updated_at: new Date(r.ended_at || r.started_at || r.created_at).toISOString(),
        completed_at: r.ended_at ? new Date(r.ended_at).toISOString() : null,
      } satisfies Task;
    });
  } catch {
    return [];
  }
}

export type TaskStatus = (typeof VALID_STATUSES)[number];
export type TaskPriority = (typeof VALID_PRIORITIES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_agent: string | null;
  dispatched_by: string | null;
  router_profile: string | null;
  model: string | null;
  complexity: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskFilters {
  status?: string;
  assigned_agent?: string;
  since?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_agent?: string;
  dispatched_by?: string;
  router_profile?: string;
  model?: string;
  complexity?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_agent?: string;
  dispatched_by?: string;
  router_profile?: string;
  model?: string;
  complexity?: number;
}

export function getTasks(filters?: TaskFilters): Task[] {
  const db = getDbRW();
  if (!db) return [];
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }
    if (filters?.assigned_agent) {
      conditions.push("assigned_agent = ?");
      params.push(filters.assigned_agent);
    }
    if (filters?.since) {
      conditions.push("created_at >= ?");
      params.push(filters.since);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return db
      .prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`)
      .all(...params) as Task[];
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export function createTask(data: CreateTaskInput): {
  ok: boolean;
  task?: Task;
  error?: string;
} {
  if (!data.title?.trim()) {
    return { ok: false, error: "title is required" };
  }

  const status = (data.status ?? "not_started") as TaskStatus;
  const priority = (data.priority ?? "medium") as TaskPriority;

  if (!VALID_STATUSES.includes(status)) {
    return {
      ok: false,
      error: `invalid status — must be one of: ${VALID_STATUSES.join(", ")}`,
    };
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    return {
      ok: false,
      error: `invalid priority — must be one of: ${VALID_PRIORITIES.join(", ")}`,
    };
  }

  const db = getDbRW();
  if (!db) return { ok: false, error: "database unavailable" };
  try {
    const result = db
      .prepare(
        `INSERT INTO tasks
           (title, description, status, priority, assigned_agent,
            dispatched_by, router_profile, model, complexity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.title.trim(),
        data.description ?? null,
        status,
        priority,
        data.assigned_agent ?? null,
        data.dispatched_by ?? null,
        data.router_profile ?? null,
        data.model ?? null,
        data.complexity ?? null
      );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid) as Task;
    return { ok: true, task };
  } catch (e) {
    return { ok: false, error: String(e) };
  } finally {
    db.close();
  }
}

export function updateTask(
  id: number,
  data: UpdateTaskInput
): { ok: boolean; task?: Task; error?: string } {
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status as TaskStatus)) {
    return {
      ok: false,
      error: `invalid status — must be one of: ${VALID_STATUSES.join(", ")}`,
    };
  }
  if (
    data.priority !== undefined &&
    !VALID_PRIORITIES.includes(data.priority as TaskPriority)
  ) {
    return {
      ok: false,
      error: `invalid priority — must be one of: ${VALID_PRIORITIES.join(", ")}`,
    };
  }

  const db = getDbRW();
  if (!db) return { ok: false, error: "database unavailable" };
  try {
    // Check task exists
    const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id);
    if (!existing) {
      return { ok: false, error: `task ${id} not found` };
    }

    const sets: string[] = ["updated_at = datetime('now')"];
    const params: unknown[] = [];

    const fields: (keyof UpdateTaskInput)[] = [
      "title",
      "description",
      "status",
      "priority",
      "assigned_agent",
      "dispatched_by",
      "router_profile",
      "model",
      "complexity",
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        sets.push(`${field} = ?`);
        params.push(data[field] ?? null);
      }
    }

    // Auto-set completed_at when status transitions to complete
    if (data.status === "complete") {
      sets.push("completed_at = datetime('now')");
    } else if (data.status !== undefined) {
      sets.push("completed_at = NULL");
    }

    params.push(id);

    db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`).run(
      ...params
    );

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task;
    return { ok: true, task };
  } catch (e) {
    return { ok: false, error: String(e) };
  } finally {
    db.close();
  }
}
