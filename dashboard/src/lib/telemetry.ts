import { execFileSync } from "child_process";

export interface AgentTelemetry {
  agent: string;
  tokens_in: number;
  tokens_out: number;
  total_tokens: number;
  estimated_cost: number;
  session_count: number;
  think_time_seconds: number | null;
}

// ── Gateway CLI helpers ───────────────────────────────────────────────────────

/**
 * Call a gateway method via the openclaw CLI.
 * Uses execFileSync (array args) — no shell, no injection risk.
 */
function gatewayCall(method: string): unknown {
  try {
    const out = execFileSync(
      "openclaw",
      ["gateway", "call", method, "--json"],
      {
        timeout: 8_000,
        env: { ...process.env, NO_COLOR: "1" },
        // Redirect stderr to /dev/null so config warnings don't pollute stdout
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).toString();
    const jsonStart = Math.max(
      out.indexOf("{") === -1 ? Infinity : out.indexOf("{"),
      out.indexOf("[") === -1 ? Infinity : out.indexOf("[")
    );
    const start = Math.min(
      out.indexOf("{") >= 0 ? out.indexOf("{") : Infinity,
      out.indexOf("[") >= 0 ? out.indexOf("[") : Infinity
    );
    return JSON.parse(out.slice(start));
  } catch {
    return null;
  }
}

// ── Types for gateway responses ───────────────────────────────────────────────

interface DailyEntry {
  date: string;
  input: number;
  output: number;
  totalTokens: number;
  totalCost: number;
}

interface UsageCostResponse {
  daily?: DailyEntry[];
}

interface AgentHealth {
  agentId: string;
  sessions?: { count?: number };
}

interface HealthResponse {
  agents?: AgentHealth[];
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getAgentTelemetry24h(): AgentTelemetry[] {
  // Today's date in YYYY-MM-DD (local time)
  const today = new Date().toLocaleDateString("en-CA");

  // Fetch daily token totals from gateway
  const costData = gatewayCall("usage.cost") as UsageCostResponse | null;
  const todayEntry = costData?.daily?.find((d) => d.date === today);

  const totalIn = todayEntry?.input ?? 0;
  const totalOut = todayEntry?.output ?? 0;
  const totalTokens = todayEntry?.totalTokens ?? 0;
  const totalCost = todayEntry?.totalCost ?? 0;

  // Fetch per-agent session counts from health endpoint
  const healthData = gatewayCall("health") as HealthResponse | null;
  const agents = healthData?.agents ?? [];

  const sessionCount = (agentId: string) =>
    agents.find((a) => a.agentId === agentId)?.sessions?.count ?? 0;

  // Gateway tracks tokens globally — attribute all to "main" (Milo),
  // since he handles every conversation and drives 99%+ of usage.
  // Other agents show their real session counts; tokens aren't tracked per-agent by Ollama.
  return [
    {
      agent: "main",
      tokens_in: totalIn,
      tokens_out: totalOut,
      total_tokens: totalTokens,
      estimated_cost: totalCost,
      session_count: sessionCount("main"),
      think_time_seconds: null,
    },
    {
      agent: "elon",
      tokens_in: 0,
      tokens_out: 0,
      total_tokens: 0,
      estimated_cost: 0,
      session_count: sessionCount("elon"),
      think_time_seconds: null,
    },
    ...agents
      .filter((a) => a.agentId !== "main" && a.agentId !== "elon")
      .map((a) => ({
        agent: a.agentId,
        tokens_in: 0,
        tokens_out: 0,
        total_tokens: 0,
        estimated_cost: 0,
        session_count: a.sessions?.count ?? 0,
        think_time_seconds: null as number | null,
      })),
  ];
}
