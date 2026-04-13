import { getAgentRoster } from "@/lib/agents";
import { getAgentTelemetry24h } from "@/lib/telemetry";
import { getGatewayTasks, getTasks } from "@/lib/tasks";
import { CommandCards } from "@/components/command-cards";
import { ActiveSpecialists } from "@/components/active-specialists";
import { KanbanBoard } from "@/components/kanban-board";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let agents: ReturnType<typeof getAgentRoster> = [];
  try { agents = getAgentRoster(); } catch { /* no-op */ }

  let telemetry: ReturnType<typeof getAgentTelemetry24h> = [];
  try { telemetry = getAgentTelemetry24h(); } catch { /* no-op */ }

  // Prefer gateway task runs (real dispatch data); fall back to local SQLite
  let tasks: ReturnType<typeof getTasks> = [];
  try {
    tasks = getGatewayTasks(50);
    if (tasks.length === 0) tasks = getTasks();
  } catch { /* no-op */ }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Section 1: Command Cards — Milo + Elon */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Command Layer
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <CommandCards agents={agents} telemetry={telemetry} />
      </section>

      {/* Section 2: Active Specialists — only when agents working */}
      <ActiveSpecialists agents={agents} telemetry={telemetry} tasks={tasks} />

      {/* Section 3: Kanban Board */}
      <section>
        <KanbanBoard tasks={tasks} />
      </section>
    </div>
  );
}
