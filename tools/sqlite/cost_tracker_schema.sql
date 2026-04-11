-- Cost tracking (Cortana writes on every API call)
CREATE TABLE IF NOT EXISTS cost_tracker (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  agent TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  estimated_cost_usd REAL DEFAULT 0.0,
  workflow TEXT,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_cost_timestamp ON cost_tracker(timestamp);
CREATE INDEX IF NOT EXISTS idx_cost_agent ON cost_tracker(agent);
