import { execFileSync } from "child_process";
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

interface DailyEntry {
  date: string;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  totalCost: number;
  missingCostEntries: number;
}

interface UsageCostResponse {
  daily?: DailyEntry[];
  totals?: {
    input: number;
    output: number;
    totalTokens: number;
    totalCost: number;
  };
}

function gatewayUsageCost(): UsageCostResponse {
  try {
    const out = execFileSync(
      "openclaw",
      ["gateway", "call", "usage.cost", "--json"],
      {
        timeout: 8_000,
        env: { ...process.env, NO_COLOR: "1" },
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).toString();
    const start = Math.min(
      out.indexOf("{") >= 0 ? out.indexOf("{") : Infinity,
      out.indexOf("[") >= 0 ? out.indexOf("[") : Infinity
    );
    return JSON.parse(out.slice(start));
  } catch {
    return {};
  }
}

function fmt$(n: number) {
  if (n === 0) return "$0.00 (local)";
  return `$${(n || 0).toFixed(4)}`;
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n || 0);
}

export default async function CostsPage() {
  const data = gatewayUsageCost();
  const daily = (data.daily ?? []).filter((d) => d.totalTokens > 0).reverse(); // most recent first
  const totals = data.totals ?? { input: 0, output: 0, totalTokens: 0, totalCost: 0 };

  // Peak day
  const peakDay = [...daily].sort((a, b) => b.totalTokens - a.totalTokens)[0] ?? null;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Costs</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Token usage &amp; spend — last 31 days · via OpenClaw Gateway
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Spend (31d)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold text-slate-900">
              {totals.totalCost === 0 ? "$0.00" : `$${totals.totalCost.toFixed(4)}`}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">Local models — no API cost</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Peak Day
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {peakDay ? (
              <>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {fmtTokens(peakDay.totalTokens)} tok
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{peakDay.date}</p>
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
                Total Tokens (31d)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold text-slate-900">
              {fmtTokens(totals.totalTokens)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              ↑{fmtTokens(totals.input)} in &nbsp;↓{fmtTokens(totals.output)} out
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {daily.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No token data available
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-slate-500 text-xs">Date</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Tokens In</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Tokens Out</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Total</TableHead>
                  <TableHead className="text-slate-500 text-xs text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.map((row) => (
                  <TableRow key={row.date} className="border-slate-100 hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-slate-800">
                      {row.date}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-emerald-700 text-right">
                      {fmtTokens(row.input)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-rose-600 text-right">
                      {fmtTokens(row.output)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 text-right">
                      {fmtTokens(row.totalTokens)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 text-right">
                      {row.totalCost === 0 ? (
                        <span className="text-emerald-600">$0.00</span>
                      ) : (
                        `$${row.totalCost.toFixed(4)}`
                      )}
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
