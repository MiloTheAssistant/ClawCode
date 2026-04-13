import { getDecisionLog } from "@/lib/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DecisionsPage() {
  let decisions: ReturnType<typeof getDecisionLog> = [];
  try { decisions = getDecisionLog(); } catch { /* graceful */ }

  // Sort by date descending
  const sorted = [...decisions].sort((a, b) => {
    if (!a.date || a.date === "—") return 1;
    if (!b.date || b.date === "—") return -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Decision Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Governance decisions — append-only record
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <span className="font-mono text-sm font-semibold text-slate-700">
            {decisions.length} entries
          </span>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            All Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No decisions logged yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-500 text-xs w-20">ID</TableHead>
                  <TableHead className="text-slate-500 text-xs w-28">Date</TableHead>
                  <TableHead className="text-slate-500 text-xs">Decision</TableHead>
                  <TableHead className="text-slate-500 text-xs w-24">Made By</TableHead>
                  <TableHead className="text-slate-500 text-xs">Context</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((d, i) => (
                  <TableRow
                    key={d.id || i}
                    className="border-slate-100 hover:bg-slate-50 align-top"
                  >
                    <TableCell className="font-mono text-xs text-indigo-600 font-semibold pt-3">
                      {d.id || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 pt-3 whitespace-nowrap">
                      {d.date && d.date !== "—" ? d.date : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-800 pt-3 leading-relaxed">
                      {d.decision}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 pt-3">
                      {d.made_by || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 pt-3 leading-relaxed">
                      {d.context && d.context !== "—" ? d.context : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
