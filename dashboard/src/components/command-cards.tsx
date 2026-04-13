import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentInfo } from "@/lib/agents";
import type { AgentTelemetry } from "@/lib/telemetry";

interface CommandCardsProps {
  agents: AgentInfo[];
  telemetry: AgentTelemetry[];
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

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

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
  return (
    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">
      IDLE
    </Badge>
  );
}

function TelemetryGrid({
  telemetry,
  agentId,
  isElon,
  allTelemetry,
}: {
  telemetry: AgentTelemetry | undefined;
  agentId: string;
  isElon: boolean;
  allTelemetry: AgentTelemetry[];
}) {
  const tokens = telemetry?.total_tokens ?? 0;
  const tokensIn = telemetry?.tokens_in ?? 0;
  const tokensOut = telemetry?.tokens_out ?? 0;
  const thinkTime = telemetry?.think_time_seconds ?? null;
  const cost = telemetry?.estimated_cost ?? 0;
  const sessionCount = telemetry?.session_count ?? 0;

  // Dispatched (Milo) = total sessions across all agents; Agents Used (Elon) = unique agents with sessions
  const fourthLabel = isElon ? "Agents Used" : "Dispatched";
  const fourthValue = isElon
    ? String(allTelemetry.filter((t) => t.session_count > 0).length)
    : String(allTelemetry.reduce((sum, t) => sum + t.session_count, 0));

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {/* Tokens */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">Tokens (24h)</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          {formatTokens(tokens)}
        </div>
        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
          <span className="text-emerald-600">↑{formatTokens(tokensIn)}</span>
          {" "}
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

      {/* Fourth metric */}
      <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
        <div className="text-[10px] text-slate-500 mb-1">{fourthLabel}</div>
        <div className="font-mono text-sm font-semibold text-slate-800">
          {fourthValue}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">sessions</div>
      </div>
    </div>
  );
}

function CommandCard({
  agent,
  telemetry,
  allTelemetry,
  glowClass,
  roleDescription,
  isElon,
}: {
  agent: AgentInfo;
  telemetry: AgentTelemetry | undefined;
  allTelemetry: AgentTelemetry[];
  glowClass: string;
  roleDescription: string;
  isElon: boolean;
}) {
  const isActive = agent.status === "active";

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Color dot with optional glow */}
            <div
              className={[
                "h-3 w-3 rounded-full shrink-0",
                isActive ? glowClass : "",
              ].join(" ")}
              style={{ backgroundColor: agent.color }}
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {agent.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {roleDescription}
              </div>
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
        <TelemetryGrid
          telemetry={telemetry}
          agentId={agent.id}
          isElon={isElon}
          allTelemetry={allTelemetry}
        />

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            {telemetry
              ? `${telemetry.session_count} session${telemetry.session_count !== 1 ? "s" : ""} today`
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

export function CommandCards({ agents, telemetry }: CommandCardsProps) {
  const milo = agents.find((a) => a.id === "main");
  const elon = agents.find((a) => a.id === "elon");

  const miloTelemetry = telemetry.find((t) => t.agent === "main");
  const elonTelemetry = telemetry.find((t) => t.agent === "elon");

  // Fallback agents when data unavailable
  const miloAgent: AgentInfo = milo ?? {
    id: "main",
    name: "Milo",
    model: "—",
    provider: "—",
    layer: "command",
    color: "#6366f1",
    status: "idle",
  };
  const elonAgent: AgentInfo = elon ?? {
    id: "elon",
    name: "Elon",
    model: "—",
    provider: "—",
    layer: "command",
    color: "#f59e0b",
    status: "idle",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CommandCard
        agent={miloAgent}
        telemetry={miloTelemetry}
        allTelemetry={telemetry}
        glowClass="glow-indigo"
        roleDescription="Executive Assistant — intake, clarity, HALT authority, 1:1 interface"
        isElon={false}
      />
      <CommandCard
        agent={elonAgent}
        telemetry={elonTelemetry}
        allTelemetry={telemetry}
        glowClass="glow-amber"
        roleDescription="First-Principles Orchestrator — task graphs, agent selection, fan-out/fan-in"
        isElon={true}
      />
    </div>
  );
}
