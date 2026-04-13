import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import { config } from "./config";

export interface AgentInfo {
  id: string;
  name: string;
  model: string;
  provider: string;
  layer: "command" | "governance" | "specialist";
  color: string;
  status: "idle" | "active" | "error" | "exclusive";
}

const AGENT_LAYERS: Record<string, "command" | "governance" | "specialist"> = {
  main: "command",
  elon: "command",
  sentinel: "governance",
  "sentinel-rt": "governance",
  cortana: "governance",
  themis: "governance",
  cerberus: "governance",
  pulse: "specialist",
  sagan: "specialist",
  quant: "specialist",
  neo: "specialist",
  cornelius: "specialist",
  hemingway: "specialist",
  jonny: "specialist",
  kairo: "specialist",
  zuck: "specialist",
  hermes: "specialist",
};

const AGENT_COLORS: Record<string, string> = {
  main: "#6366f1",
  elon: "#f59e0b",
  sentinel: "#ef4444",
  "sentinel-rt": "#dc2626",
  cortana: "#8b5cf6",
  themis: "#64748b",
  cerberus: "#991b1b",
  pulse: "#10b981",
  sagan: "#3b82f6",
  quant: "#f97316",
  neo: "#06b6d4",
  cornelius: "#a855f7",
  hemingway: "#ec4899",
  jonny: "#eab308",
  kairo: "#6366f1",
  zuck: "#14b8a6",
  hermes: "#8b5cf6",
};

const OPENCLAW_DIR =
  process.env.OPENCLAW_DIR || "/Volumes/BotCentral/Users/milo/.openclaw";

function getAgentSessionStatus(
  agentId: string
): "idle" | "active" | "error" | "exclusive" {
  try {
    const sessionsFile = join(
      OPENCLAW_DIR,
      "agents",
      agentId,
      "sessions",
      "sessions.json"
    );
    if (!existsSync(sessionsFile)) return "idle";
    const raw = readFileSync(sessionsFile, "utf-8");
    const sessions = JSON.parse(raw);
    const keys = Object.keys(sessions);
    if (keys.length === 0) return "idle";
    // Check if any session was updated in the last 10 minutes
    const now = Date.now();
    for (const key of keys) {
      const s = sessions[key];
      if (s.updatedAt && now - s.updatedAt < 10 * 60 * 1000) {
        return "active";
      }
    }
    return "idle";
  } catch {
    return "idle";
  }
}

function extractProvider(model: string): string {
  if (model.startsWith("ollama/")) return "Ollama Local";
  if (model.startsWith("nim/")) return "NIM";
  if (model.startsWith("openai-codex/") || model.startsWith("codex/"))
    return "Codex";
  if (model.startsWith("perplexity/")) return "Perplexity";
  if (model.startsWith("zai/")) return "Z.ai";
  if (model.startsWith("openai/")) return "OpenAI";
  return "Unknown";
}

export function getAgentRoster(): AgentInfo[] {
  try {
    const raw = readFileSync(
      join(config.openclawMaster.root, "openclaw.json"),
      "utf-8"
    );
    const data = JSON.parse(raw);
    const agents = data.agents?.list ?? [];

    return agents.map(
      (a: { id: string; name: string; model: string }) => ({
        id: a.id,
        name: a.name,
        model: a.model.split("/").pop() || a.model,
        provider: extractProvider(a.model),
        layer: AGENT_LAYERS[a.id] || "specialist",
        color: AGENT_COLORS[a.id] || "#6366f1",
        status: getAgentSessionStatus(a.id),
      })
    );
  } catch {
    return [];
  }
}
