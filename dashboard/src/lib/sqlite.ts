import { existsSync } from "fs";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { config } from "./config";

function getDb() {
  try {
    if (!existsSync(config.sqlite.dbPath)) return null;
    // Dynamic import to avoid crash when better-sqlite3 native module isn't available (e.g. Vercel)
    const Database = require("better-sqlite3");
    return new Database(config.sqlite.dbPath, { readonly: true });
  } catch {
    return null;
  }
}

export function getDbRW() {
  try {
    // Ensure parent directory exists before opening/creating the database
    const dir = dirname(config.sqlite.dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const Database = require("better-sqlite3");
    const db = new Database(config.sqlite.dbPath);
    // Create tasks table on first call if it doesn't exist
    const createTasks = `
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
      )
    `;
    db.prepare(createTasks).run();
    return db;
  } catch {
    return null;
  }
}

export function queryCosts(period: "day" | "week" | "month" = "month") {
  const db = getDb();
  if (!db) return [];
  try {
    const intervals: Record<string, string> = {
      day: "datetime('now', '-1 day')",
      week: "datetime('now', '-7 days')",
      month: "datetime('now', 'start of month')",
    };
    return db
      .prepare(
        `SELECT agent, provider, model,
                SUM(tokens_in) as tokens_in,
                SUM(tokens_out) as tokens_out,
                SUM(estimated_cost_usd) as total_cost
         FROM cost_tracker
         WHERE timestamp > ${intervals[period]}
         GROUP BY agent ORDER BY total_cost DESC`
      )
      .all();
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export function queryMemoryOps(limit = 50) {
  const db = getDb();
  if (!db) return [];
  try {
    return db
      .prepare(
        `SELECT timestamp, agent, operation, query, result_count, content_preview
         FROM memory_ops_log ORDER BY timestamp DESC LIMIT ?`
      )
      .all(limit);
  } catch {
    return [];
  } finally {
    db.close();
  }
}

export function queryRecentCostsByAgent() {
  const db = getDb();
  if (!db) return [];
  try {
    return db
      .prepare(
        `SELECT agent, SUM(estimated_cost_usd) as total_cost,
                SUM(tokens_in + tokens_out) as total_tokens
         FROM cost_tracker
         WHERE timestamp > datetime('now', '-30 days')
         GROUP BY agent ORDER BY total_cost DESC`
      )
      .all();
  } catch {
    return [];
  } finally {
    db.close();
  }
}
