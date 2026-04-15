"use client";

import { useState } from "react";
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

function ApprovalButtons({
  taskId,
  onAction,
}: {
  taskId: number;
  onAction: (taskId: number, action: "approve" | "reject") => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    onAction(taskId, action);
  }

  return (
    <div className="flex gap-1.5 mt-2">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        className="flex-1 text-[10px] font-semibold px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading === "approve" ? "Dispatching..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="flex-1 text-[10px] font-semibold px-2 py-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-50 transition-colors"
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}

function KanbanCard({
  task,
  dimmed,
  isApproval,
  onAction,
}: {
  task: Task;
  dimmed: boolean;
  isApproval: boolean;
  onAction: (taskId: number, action: "approve" | "reject") => void;
}) {
  const dispatchChain = [task.dispatched_by, task.assigned_agent]
    .filter(Boolean)
    .join(" → ");

  return (
    <div
      className={[
        "bg-white border border-slate-200 rounded-md p-2.5 shadow-sm",
        dimmed ? "opacity-75" : "",
        isApproval ? "border-violet-200" : "",
      ].join(" ")}
    >
      {/* Title + priority */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">
          {task.title}
        </span>
        {priorityBadge(task.priority)}
      </div>

      {/* Description preview for approval items */}
      {isApproval && task.description && (
        <p className="text-[10px] text-slate-500 line-clamp-3 mb-1.5">
          {task.description}
        </p>
      )}

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

      {/* Approve / Reject buttons for approval lane (local tasks have negative IDs) */}
      {isApproval && task.id !== 0 && (
        <ApprovalButtons taskId={Math.abs(task.id)} onAction={onAction} />
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
  onAction,
}: {
  label: string;
  status: string;
  headerColor: string;
  dotColor: string;
  tasks: Task[];
  onAction: (taskId: number, action: "approve" | "reject") => void;
}) {
  const isComplete = status === "complete";
  const isApproval = status === "approval";

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
            <KanbanCard
              key={task.id}
              task={task}
              dimmed={isComplete}
              isApproval={isApproval}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const activeCount = tasks.filter((t) => t.status === "working").length;
  const stuckCount = tasks.filter((t) => t.status === "stuck").length;
  const approvalCount = tasks.filter((t) => t.status === "approval").length;

  // Today's completed tasks (completed_at is today)
  const today = new Date().toISOString().slice(0, 10);
  const completeToday = tasks.filter(
    (t) => t.status === "complete" && t.completed_at?.startsWith(today)
  ).length;

  async function handleAction(taskId: number, action: "approve" | "reject") {
    try {
      const resp = await fetch(`/api/tasks/${taskId}/${action}`, {
        method: "POST",
      });
      if (resp.ok) {
        // Optimistically move the task
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: action === "approve" ? ("working" as const) : ("complete" as const),
                }
              : t
          )
        );
      }
    } catch {
      // silently fail — user can refresh
    }
  }

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
            <span
              className={
                approvalCount > 0 ? "text-violet-600" : "text-slate-400"
              }
            >
              {approvalCount} approval
            </span>
            <span className="text-slate-300 mx-1.5">·</span>
            <span
              className={stuckCount > 0 ? "text-rose-500" : "text-slate-400"}
            >
              {stuckCount} stuck
            </span>
            <span className="text-slate-300 mx-1.5">·</span>
            <span className="text-emerald-600">
              {completeToday} complete today
            </span>
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
              tasks={
                lane.status === "complete"
                  ? tasks
                      .filter((t) => t.status === "complete")
                      .slice(0, 8)
                  : tasks.filter((t) => t.status === lane.status)
              }
              onAction={handleAction}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
