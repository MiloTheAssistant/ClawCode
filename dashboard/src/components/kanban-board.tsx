import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/tasks";

interface KanbanBoardProps {
  tasks: Task[];
}

const LANES = [
  {
    label: "Not Started",
    status: "not_started",
    headerColor: "bg-slate-100 text-slate-600 border-slate-200",
    dotColor: "bg-slate-400",
  },
  {
    label: "Working",
    status: "working",
    headerColor: "bg-sky-50 text-sky-700 border-sky-200",
    dotColor: "bg-sky-600",
  },
  {
    label: "Approval",
    status: "approval",
    headerColor: "bg-violet-50 text-violet-700 border-violet-200",
    dotColor: "bg-violet-600",
  },
  {
    label: "Stuck",
    status: "stuck",
    headerColor: "bg-rose-50 text-rose-700 border-rose-200",
    dotColor: "bg-rose-600",
  },
  {
    label: "Complete",
    status: "complete",
    headerColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-600",
  },
] as const;

function priorityBadge(priority: string) {
  if (priority === "high") {
    return (
      <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200 font-medium">
        HIGH
      </Badge>
    );
  }
  if (priority === "medium") {
    return (
      <Badge className="text-[9px] px-1 py-0 h-4 bg-indigo-100 text-indigo-700 border-indigo-200 font-medium">
        MED
      </Badge>
    );
  }
  return (
    <Badge className="text-[9px] px-1 py-0 h-4 bg-slate-100 text-slate-600 border-slate-200 font-medium">
      LOW
    </Badge>
  );
}

function KanbanCard({ task, dimmed }: { task: Task; dimmed: boolean }) {
  const dispatchChain = [task.dispatched_by, task.assigned_agent]
    .filter(Boolean)
    .join(" → ");

  return (
    <div
      className={[
        "bg-white border border-slate-200 rounded-md p-2.5 shadow-sm",
        dimmed ? "opacity-75" : "",
      ].join(" ")}
    >
      {/* Title + priority */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">
          {task.title}
        </span>
        {priorityBadge(task.priority)}
      </div>

      {/* Dispatch chain */}
      {dispatchChain && (
        <div className="text-[10px] text-slate-500 mb-1 truncate">
          {dispatchChain}
        </div>
      )}

      {/* Model */}
      {task.model && (
        <div className="font-mono text-[9px] text-slate-400 truncate">
          {task.model.split("/").pop()}
        </div>
      )}
    </div>
  );
}

function LaneColumn({
  label,
  status,
  headerColor,
  dotColor,
  tasks,
}: {
  label: string;
  status: string;
  headerColor: string;
  dotColor: string;
  tasks: Task[];
}) {
  const isComplete = status === "complete";

  return (
    <div className="flex flex-col min-w-0">
      {/* Lane header */}
      <div
        className={[
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md border mb-2 text-[11px] font-semibold",
          headerColor,
        ].join(" ")}
      >
        <div className={`h-2 w-2 rounded-full ${dotColor} shrink-0`} />
        <span className="truncate">{label}</span>
        <span className="ml-auto font-mono opacity-60">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="text-[10px] text-slate-300 text-center py-3 italic">
            empty
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} dimmed={isComplete} />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const activeCount = tasks.filter((t) => t.status === "working").length;
  const stuckCount = tasks.filter((t) => t.status === "stuck").length;

  // Today's completed tasks (completed_at is today)
  const today = new Date().toISOString().slice(0, 10);
  const completeToday = tasks.filter(
    (t) => t.status === "complete" && t.completed_at?.startsWith(today)
  ).length;

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Dispatch Board
          </CardTitle>
          <div className="text-[11px] font-mono text-slate-500 shrink-0">
            <span className="text-sky-600">{activeCount} active</span>
            <span className="text-slate-300 mx-1.5">·</span>
            <span className={stuckCount > 0 ? "text-rose-500" : "text-slate-400"}>
              {stuckCount} stuck
            </span>
            <span className="text-slate-300 mx-1.5">·</span>
            <span className="text-emerald-600">{completeToday} complete today</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-5 gap-3">
          {LANES.map((lane) => (
            <LaneColumn
              key={lane.status}
              label={lane.label}
              status={lane.status}
              headerColor={lane.headerColor}
              dotColor={lane.dotColor}
              tasks={tasks.filter((t) => t.status === lane.status)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
