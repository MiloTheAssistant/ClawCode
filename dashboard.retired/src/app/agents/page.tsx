import { getAgentRoster } from "@/lib/agents";
import { getAgentTelemetry24h } from "@/lib/telemetry";
import { getTasks } from "@/lib/tasks";
import { AgentFleet } from "@/components/agent-fleet";

export const dynamic = "force-dynamic";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export default async function AgentsPage() {
  let agents: ReturnType<typeof getAgentRoster> = [];
  try {
    agents = getAgentRoster();
  } catch {
    /* no-op */
  }

  let telemetry: ReturnType<typeof getAgentTelemetry24h> = [];
  try {
    telemetry = getAgentTelemetry24h();
  } catch {
    /* no-op */
  }

  let tasks: ReturnType<typeof getTasks> = [];
  try {
    tasks = getTasks();
  } catch {
    /* no-op */
  }

  // Summary stats
  const activeCount = agents.filter(
    (a) => a.status === "active" || a.status === "exclusive"
  ).length;
  const totalTokens = telemetry.reduce((sum, t) => sum + t.total_tokens, 0);
  const totalCost = telemetry.reduce((sum, t) => sum + t.estimated_cost, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Agents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {agents.length} agents
            {" · "}
            <span className="text-sky-600 font-medium">{activeCount} active now</span>
          </p>
        </div>

        {/* 24h totals */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tokens (24h)</div>
            <div className="font-mono text-sm font-semibold text-slate-800">
              {formatTokens(totalTokens)}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cost (24h)</div>
            <div className="font-mono text-sm font-semibold text-slate-800">
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet */}
      <AgentFleet agents={agents} telemetry={telemetry} tasks={tasks} />
    </div>
  );
}
