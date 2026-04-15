import type { ElementType } from "react";
import { queryMemoryOps } from "@/lib/sqlite";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Search, PenLine, Eye, Sparkles } from "lucide-react";

interface MemoryOp {
  timestamp: string;
  agent: string;
  operation: string;
  query: string | null;
  result_count: number | null;
  content_preview: string | null;
}

export const dynamic = "force-dynamic";

const opColors: Record<string, string> = {
  search: "bg-blue-50 text-blue-700 border-blue-200",
  write:  "bg-amber-50 text-amber-700 border-amber-200",
  read:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  embed:  "bg-purple-50 text-purple-700 border-purple-200",
};

const opIcons: Record<string, ElementType> = {
  search: Search,
  write:  PenLine,
  read:   Eye,
  embed:  Sparkles,
};

function formatTs(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return ts;
  }
}

export default async function MemoryPage() {
  let ops: MemoryOp[] = [];
  try { ops = queryMemoryOps(100) as MemoryOp[]; } catch { /* graceful */ }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Memory Operations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Agent memory reads, writes, searches, and embeds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-indigo-500" />
          <span className="font-mono text-sm font-semibold text-slate-700">
            {ops.length} ops
          </span>
        </div>
      </div>

      {/* Timeline Feed */}
      {ops.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-16 text-center">
          <ScrollText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No memory operations recorded yet</p>
          <p className="text-xs text-slate-300 mt-1">
            Ops appear as agents read/write memory
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ops.map((op, i) => {
            const Icon = opIcons[op.operation] || Eye;
            const colorCls = opColors[op.operation] || "bg-slate-50 text-slate-600 border-slate-200";
            return (
              <div
                key={`${op.timestamp}-${i}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-start gap-3"
              >
                {/* Icon dot */}
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800">
                      {op.agent}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0 font-medium ${colorCls}`}
                    >
                      {op.operation}
                    </Badge>
                    {op.result_count !== null && op.result_count !== undefined && (
                      <span className="text-xs text-slate-400 font-mono">
                        {op.result_count} result{op.result_count !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-xs text-slate-400 shrink-0">
                      {formatTs(op.timestamp)}
                    </span>
                  </div>

                  {/* Query */}
                  {op.query && (
                    <p className="text-xs text-slate-600 truncate">
                      <span className="text-slate-400">query: </span>
                      {op.query}
                    </p>
                  )}

                  {/* Content preview */}
                  {op.content_preview && (
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                      {op.content_preview.slice(0, 120)}
                      {op.content_preview.length > 120 ? "…" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
