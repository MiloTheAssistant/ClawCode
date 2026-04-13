import type { AgentInfo } from "@/lib/agents";
import type { AgentTelemetry } from "@/lib/telemetry";
import type { Task } from "@/lib/tasks";

interface ActiveSpecialistsProps {
  agents: AgentInfo[];
  telemetry: AgentTelemetry[];
  tasks: Task[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

function formatElapsed(seconds: number | null): string {
  if (!seconds || seconds === 0) return "—";
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
}

export function ActiveSpecialists({ agents, telemetry, tasks }: ActiveSpecialistsProps) {
  const activeSpecialists = agents.filter(
    (a) => a.layer === "specialist" && a.status === "active"
  );

  if (activeSpecialists.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Active Specialists
        </span>
        <span className="text-[10px] font-mono text-sky-600 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5">
          {activeSpecialists.length} working
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {activeSpecialists.map((agent) => {
          const tel = telemetry.find((t) => t.agent === agent.id);
          const currentTask = tasks.find(
            (t) => t.assigned_agent === agent.id && t.status === "working"
          );

          return (
            <div
              key={agent.id}
              className="flex-shrink-0 bg-white border-l-2 border-sky-600 border-t border-r border-b border-slate-200 rounded-md px-3 py-2.5 shadow-sm min-w-[200px] max-w-[240px]"
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0 glow-sky"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {agent.name}
                </span>
              </div>

              {/* Model */}
              <div className="font-mono text-[10px] text-slate-400 mb-1.5 truncate">
                {agent.model}
              </div>

              {/* Current task */}
              {currentTask && (
                <div className="text-[10px] text-slate-600 mb-2 line-clamp-1 italic">
                  {currentTask.title}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span className="text-sky-600">
                  {formatTokens(tel?.total_tokens ?? 0)} tok
                </span>
                <span className="text-slate-300">·</span>
                <span>{formatElapsed(tel?.think_time_seconds ?? null)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
