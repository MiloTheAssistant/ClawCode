import { getBrainStats } from "@/lib/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, FileText, FolderOpen, Newspaper, Clock, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function BrainPage() {
  let stats: ReturnType<typeof getBrainStats> = {
    wikiArticles: 0,
    rawSources: 0,
    briefings: 0,
    lastWikiUpdate: null,
    lastBriefing: null,
  };
  try { stats = getBrainStats(); } catch { /* graceful */ }

  const countStats = [
    {
      label: "Wiki Articles",
      value: stats.wikiArticles,
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Raw Sources",
      value: stats.rawSources,
      icon: FolderOpen,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Briefings",
      value: stats.briefings,
      icon: Newspaper,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  const dateStats = [
    {
      label: "Last Briefing",
      value: formatDate(stats.lastBriefing),
      icon: Clock,
    },
    {
      label: "Last Wiki Update",
      value: formatDate(stats.lastWikiUpdate),
      icon: RefreshCw,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">2Brain Intelligence</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Knowledge base and briefing system stats
          </p>
        </div>
        <Brain className="h-5 w-5 text-indigo-500" />
      </div>

      {/* Count Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {countStats.map((stat) => (
          <Card key={stat.label} className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`rounded-md p-1.5 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold text-slate-900">
                {stat.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dateStats.map((stat) => (
          <Card key={stat.label} className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm font-semibold text-slate-800">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
