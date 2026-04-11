import { existsSync } from "fs";
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
