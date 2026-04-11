-- Memory operations transparency log
CREATE TABLE IF NOT EXISTS memory_ops_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  agent TEXT NOT NULL,
  operation TEXT NOT NULL,  -- 'read', 'write', 'search', 'embed'
  query TEXT,
  result_count INTEGER,
  content_preview TEXT,     -- first 200 chars
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_memops_timestamp ON memory_ops_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_memops_agent ON memory_ops_log(agent);
