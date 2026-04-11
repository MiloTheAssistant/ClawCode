import Database from "better-sqlite3";
import { config } from "./config";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(config.sqlite.dbPath, { readonly: true });
  }
  return db;
}

export function queryCosts(period: "day" | "week" | "month" = "month") {
  const intervals: Record<string, string> = {
    day: "datetime('now', '-1 day')",
    week: "datetime('now', '-7 days')",
    month: "datetime('now', 'start of month')",
  };
  return getDb()
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
}

export function queryMemoryOps(limit = 50) {
  return getDb()
    .prepare(
      `SELECT timestamp, agent, operation, query, result_count, content_preview
       FROM memory_ops_log ORDER BY timestamp DESC LIMIT ?`
    )
    .all(limit);
}

export function queryRecentCostsByAgent() {
  return getDb()
    .prepare(
      `SELECT agent, SUM(estimated_cost_usd) as total_cost,
              SUM(tokens_in + tokens_out) as total_tokens
       FROM cost_tracker
       WHERE timestamp > datetime('now', '-30 days')
       GROUP BY agent ORDER BY total_cost DESC`
    )
    .all();
}
