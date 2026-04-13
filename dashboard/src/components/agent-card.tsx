import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentInfo } from "@/lib/agents";
import type { AgentTelemetry } from "@/lib/telemetry";
import type { Task } from "@/lib/tasks";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function formatThinkTime(seconds: number | null): string {
  if (!seconds || seconds === 0) return "—";
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) {
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

const LAYER_LABELS: Record<AgentInfo["layer"], string> = {
  command: "Command Layer",
  governance: "Governance Layer",
  specialist: "Specialist",
};

// Map agent color hex to glow class (best-effort; falls back to glow-indigo)
function glowClassForAgent(agent: AgentInfo): string {
  const c = agent.color.toLowerCase();
  // indigo / violet
  if (c === "#6366f1" || c === "#8b5cf6") return "glow-indigo";
  // amber / yellow
  if (c === "#f59e0b" || c === "#eab308") return "glow-amber";
  // rose / red
  if (
    c === "#ef4444" ||
    c === "#dc2626" ||
    c === "#991b1b" ||
    c === "#ec4899"
  )
    return "glow-rose";
  // emerald / teal / cyan
  if (c === "#10b981" || c === "#14b8a6" || c === "#06b6d4")
    return "glow-emerald";
  // sky / blue
  if (c === "#3b82f6" || c === "#a855f7" || c === "#f97316")
    return "glow-sky";
  return "glow-indigo";
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AgentInfo["status"] }) {
  if (status === "active") {
    return (
      <Badge className="text-[10px] bg-sky-100 text-sky-700 border-sky-200 animate-pulse">
        WORKING
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-200">
        ERROR
      </Badge>
    );
  }
  if (status === "exclusive") {
    return (
      <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
        EXCLUSIVE
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
      IDLE
    </Badge>
  );
}

// ─── Telemetry Grid ───────────────────────────────────────────────────────────

function TelemetryGrid({
  telemetry,
  sessions,
}: {
  telemetry: AgentTelemetry | undefined;
  sessions: number;
}) {
  const tokens = telemetry?.total_tokens ?? 0;
  const tokensIn = telemetry?.tokens_in ?? 0;
  const tokensOut = telemetry?.tokens_out ?? 0;
  const thinkTime = telemetry?.think_time_seconds ?? null;
  const cost = telemetry?.estimated_cost ?? 0;

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {/* Tokens */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">Tokens (24h)</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          {formatTokens(tokens)}
        </div>
        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
          <span className="text-emerald-600">↑{formatTokens(tokensIn)}</span>{" "}
          <span className="text-rose-500">↓{formatTokens(tokensOut)}</span>
        </div>
      </div>

      {/* Think Time */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">Think Time</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          {formatThinkTime(thinkTime)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">total session</div>
      </div>

      {/* Cost */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">Est. Cost (24h)</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          ${cost.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">USD</div>
      </div>

      {/* Sessions */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">Sessions</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          {sessions}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">today</div>
      </div>
    </div>
  );
}

// ─── AgentCard Props ──────────────────────────────────────────────────────────

export interface AgentCardProps {
  agent: AgentInfo;
  telemetry?: AgentTelemetry;
  tasks?: Task[];
  /** When true, renders as full card. When false, renders as compact chip. */
  mode: "full" | "compact";
}

// ─── Full Card ────────────────────────────────────────────────────────────────

function AgentCardFull({ agent, telemetry, tasks = [] }: Omit<AgentCardProps, "mode">) {
  const isActive = agent.status === "active";
  const glow = glowClassForAgent(agent);
  const currentTask = tasks.find(
    (t) => t.assigned_agent === agent.id && t.status === "working"
  );
  const sessions = telemetry?.session_count ?? 0;
  const layerLabel = LAYER_LABELS[agent.layer];

  return (
    <Card
      className={[
        "bg-white border-slate-200 shadow-sm",
        isActive ? "agent-active" : "agent-idle",
      ].join(" ")}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Color dot with optional glow */}
            <div
              className={["h-3 w-3 rounded-full shrink-0", isActive ? glow : ""].join(" ")}
              style={{ backgroundColor: agent.color }}
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {agent.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{layerLabel}</div>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* Model + provider */}
        <div className="mt-2 font-mono text-[11px] text-slate-400">
          {agent.model}{" "}
          <span className="text-slate-300">·</span>{" "}
          <span className="text-indigo-400">{agent.provider}</span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <TelemetryGrid telemetry={telemetry} sessions={sessions} />

        {/* Current task */}
        {currentTask && (
          <div className="mt-2 px-2 py-1.5 bg-sky-50 border border-sky-100 rounded text-[10px] text-sky-700 line-clamp-1 italic">
            {currentTask.title}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            {telemetry
              ? `${sessions} session${sessions !== 1 ? "s" : ""} today`
              : "No activity today"}
          </span>
          {isActive && (
            <span className="text-[10px] text-sky-600 font-mono">● active</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Compact Chip ─────────────────────────────────────────────────────────────

function AgentCardCompact({ agent, telemetry }: Omit<AgentCardProps, "mode">) {
  const tokens = telemetry?.total_tokens ?? 0;

  return (
    <div
      className="agent-idle inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm text-[11px] text-slate-600"
    >
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: agent.color }}
      />
      <span className="font-medium">{agent.name}</span>
      <span className="font-mono text-slate-400">
        {formatTokens(tokens)} tok
      </span>
    </div>
  );
}

// ─── AgentCard (exported) ─────────────────────────────────────────────────────

export function AgentCard({ agent, telemetry, tasks, mode }: AgentCardProps) {
  if (mode === "compact") {
    return <AgentCardCompact agent={agent} telemetry={telemetry} tasks={tasks} />;
  }
  return <AgentCardFull agent={agent} telemetry={telemetry} tasks={tasks} />;
}
