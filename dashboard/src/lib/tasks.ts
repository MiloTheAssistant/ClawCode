import { getDbRW } from "./sqlite";

const VALID_STATUSES = [
  "not_started",
  "working",
  "approval",
  "stuck",
  "complete",
] as const;
const VALID_PRIORITIES = ["low", "medium", "high"] as const;

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
