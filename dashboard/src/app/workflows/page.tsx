import { getWorkflows } from "@/lib/workflows";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircuitBoard, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { badge: string; dot: string }> = {
  active:           { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  paused:           { badge: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400"   },
  pending_approval: { badge: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400"   },
  error:            { badge: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-400"    },
};

function getStyle(status: string) {
  return statusStyles[status] ?? statusStyles.paused;
}

export default async function WorkflowsPage() {
  let workflows: ReturnType<typeof getWorkflows> = [];
  try { workflows = getWorkflows(); } catch { /* graceful */ }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Workflows</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Scheduled automation and recurring tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CircuitBoard className="h-4 w-4 text-indigo-500" />
          <span className="font-mono text-sm font-semibold text-slate-700">
            {workflows.length} workflow{workflows.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Workflow Cards */}
      {workflows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-16 text-center">
          <CircuitBoard className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No workflows configured</p>
          <p className="text-xs text-slate-300 mt-1">
            Add entries to state/workflows.json to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => {
            const style = getStyle(wf.status);
            return (
              <Card key={wf.name} className="bg-white border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-800 leading-snug">
                      {wf.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 font-medium ${style.badge}`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${style.dot}`}
                      />
                      {wf.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {wf.schedule}
                  </div>
                  {wf.lastRun && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Last: {wf.lastRun}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
