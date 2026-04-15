import type { AgentInfo } from "@/lib/agents";
import type { AgentTelemetry } from "@/lib/telemetry";
import type { Task } from "@/lib/tasks";
import { AgentCard } from "./agent-card";

interface AgentFleetProps {
  agents: AgentInfo[];
  telemetry: AgentTelemetry[];
  tasks: Task[];
}

// An agent gets a full card if it's active/error/exclusive, OR has 24h telemetry
function shouldShowFull(
  agent: AgentInfo,
  tel: AgentTelemetry | undefined,
  layer: AgentInfo["layer"]
): boolean {
  if (layer === "command") return true;
  if (agent.status === "active" || agent.status === "error" || agent.status === "exclusive") return true;
  if (tel && tel.total_tokens > 0) return true;
  return false;
}

// Section heading row
function LayerHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </span>
      <span className="font-mono text-[10px] text-slate-400">{count} agents</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// Section of full-card agents (grid) + compact chips for inactive
function LayerSection({
  label,
  agents,
  telemetry,
  tasks,
  layer,
}: {
  label: string;
  agents: AgentInfo[];
  telemetry: AgentTelemetry[];
  tasks: Task[];
  layer: AgentInfo["layer"];
}) {
  const fullAgents = agents.filter((a) => {
    const tel = telemetry.find((t) => t.agent === a.id);
    return shouldShowFull(a, tel, layer);
  });
  const compactAgents = agents.filter((a) => {
    const tel = telemetry.find((t) => t.agent === a.id);
    return !shouldShowFull(a, tel, layer);
  });

  return (
    <section>
      <LayerHeading label={label} count={agents.length} />

      {/* Full cards grid */}
      {fullAgents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
          {fullAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              telemetry={telemetry.find((t) => t.agent === agent.id)}
              tasks={tasks}
              mode="full"
            />
          ))}
        </div>
      )}

      {/* Compact chips for inactive agents */}
      {compactAgents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {compactAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              telemetry={telemetry.find((t) => t.agent === agent.id)}
              tasks={tasks}
              mode="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function AgentFleet({ agents, telemetry, tasks }: AgentFleetProps) {
  const commandAgents = agents.filter((a) => a.layer === "command");
  const governanceAgents = agents.filter((a) => a.layer === "governance");
  const specialistAgents = agents.filter((a) => a.layer === "specialist");

  return (
    <div className="space-y-8">
      {commandAgents.length > 0 && (
        <LayerSection
          label="Command Layer"
          agents={commandAgents}
          telemetry={telemetry}
          tasks={tasks}
          layer="command"
        />
      )}

      {governanceAgents.length > 0 && (
        <LayerSection
          label="Governance Layer"
          agents={governanceAgents}
          telemetry={telemetry}
          tasks={tasks}
          layer="governance"
        />
      )}

      {specialistAgents.length > 0 && (
        <LayerSection
          label="Specialist Layer"
          agents={specialistAgents}
          telemetry={telemetry}
          tasks={tasks}
          layer="specialist"
        />
      )}
    </div>
  );
}
