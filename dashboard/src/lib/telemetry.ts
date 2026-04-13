import { queryCosts } from "./sqlite";

// Import getDb directly — we need readonly access to cost_tracker
import { existsSync } from "fs";
import { config } from "./config";

function getDb() {
  try {
    if (!existsSync(config.sqlite.dbPath)) return null;
    const Database = require("better-sqlite3");
    return new Database(config.sqlite.dbPath, { readonly: true });
  } catch {
    return null;
  }
}

export interface AgentTelemetry {
  agent: string;
  tokens_in: number;
  tokens_out: number;
  total_tokens: number;
  estimated_cost: number;
  session_count: number;
  think_time_seconds: number | null;
}

export function getAgentTelemetry24h(): AgentTelemetry[] {
  const db = getDb();
  if (!db) return [];
  try {
    // Check whether the duration_seconds column exists in cost_tracker
    const columns: { name: string }[] = db
      .prepare("PRAGMA table_info(cost_tracker)")
      .all() as { name: string }[];
    const hasDuration = columns.some((c) => c.name === "duration_seconds");

    const durationExpr = hasDuration
      ? "SUM(duration_seconds)"
      : "NULL";

    return db
      .prepare(
        `SELECT
           agent,
           SUM(tokens_in)              AS tokens_in,
           SUM(tokens_out)             AS tokens_out,
           SUM(tokens_in + tokens_out) AS total_tokens,
           SUM(estimated_cost_usd)     AS estimated_cost,
           COUNT(*)                    AS session_count,
           ${durationExpr}             AS think_time_seconds
         FROM cost_tracker
         WHERE timestamp > datetime('now', '-1 day')
         GROUP BY agent
         ORDER BY estimated_cost DESC`
      )
      .all() as AgentTelemetry[];
  } catch {
    return [];
  } finally {
    db.close();
  }
}
