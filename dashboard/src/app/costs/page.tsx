import { queryCosts, queryRecentCostsByAgent } from "@/lib/sqlite";
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
import { DollarSign, Cpu, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

interface CostRow {
  agent: string;
  provider: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  total_cost: number;
}

interface AgentCostRow {
  agent: string;
  total_cost: number;
  total_tokens: number;
}

function fmt$(n: number) {
  return `$${(n || 0).toFixed(2)}`;
}

function fmtTokens(n: number) {
  return (n || 0).toLocaleString();
}

export default async function CostsPage() {
  let monthly: CostRow[] = [];
  try { monthly = queryCosts("month") as CostRow[]; } catch { /* graceful */ }

  let byAgent: AgentCostRow[] = [];
  try { byAgent = queryRecentCostsByAgent() as AgentCostRow[]; } catch { /* graceful */ }

  const totalSpend = byAgent.reduce((s: number, r: AgentCostRow) => s + (r.total_cost || 0), 0);
  const totalTokens = byAgent.reduce((s: number, r: AgentCostRow) => s + (r.total_tokens || 0), 0);
  const topAgent = byAgent[0] ?? null;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Costs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Spending breakdown — last 30 days
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Spend (30d)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold text-slate-900">
              {fmt$(totalSpend)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Top Agent
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topAgent ? (
              <>
                <p className="font-semibold text-slate-900">{topAgent.agent}</p>
                <p className="font-mono text-sm text-slate-500">
                  {fmt$(topAgent.total_cost)}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tokens (30d)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold text-slate-900">
              {fmtTokens(totalTokens)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Monthly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {monthly.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No cost data for this period
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-500 text-xs">Agent</TableHead>
                  <TableHead className="text-slate-500 text-xs">Model</TableHead>
                  <TableHead className="text-slate-500 text-xs">Provider</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Tokens In</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Tokens Out</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((row, i) => (
                  <TableRow key={`${row.agent}-${i}`} className="border-slate-100 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800 text-sm">
                      {row.agent}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {row.model}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {row.provider}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 text-right">
                      {fmtTokens(row.tokens_in)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 text-right">
                      {fmtTokens(row.tokens_out)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-800 text-right">
                      {fmt$(row.total_cost)}
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
