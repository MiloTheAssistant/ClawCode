import Link from "next/link";
import {
  getBrainStats,
  getWikiArticles,
  getBriefings,
} from "@/lib/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  FolderOpen,
  Newspaper,
  Clock,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

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

function formatDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const wikiArticles = getWikiArticles();
  const briefings = getBriefings();

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
            Knowledge base and briefing system
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

      {/* Briefings List */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold text-slate-700">Briefings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {briefings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No briefings found</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {briefings.map((b) => (
                <Link
                  key={b.date}
                  href={`/brain/briefings/${b.date}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-800">
                        {b.date}
                      </span>
                      <span className="text-xs text-slate-400">{b.weekday}</span>
                      {b.edition === "weekend-life-briefing" ? (
                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                          Weekend
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500">
                          Daily
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-400">
                        {b.confidence}
                      </Badge>
                    </div>
                    {b.theme && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{b.theme}</p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {b.sectionNames.join(" · ")}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wiki Articles List */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-500" />
            <CardTitle className="text-sm font-semibold text-slate-700">Wiki Articles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className={wikiArticles.length === 0 ? undefined : "p-0"}>
          {wikiArticles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No wiki articles yet</p>
              <p className="text-xs text-slate-300 mt-1">
                Drop sources into <code className="font-mono">2Brain/raw/</code> and run an ingest
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {wikiArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/brain/wiki/${a.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                    {a.summary && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{a.summary}</p>
                    )}
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Updated {formatDateShort(a.lastModified)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
