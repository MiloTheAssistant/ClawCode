import { notFound } from "next/navigation";
import Link from "next/link";
import { getBriefingByDate } from "@/lib/state";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  marketHeadlines: "Market Headlines",
  bitcoin: "Bitcoin",
  strategy: "Strategy",
  institutional: "Institutional",
  creatorIntel: "Creator Intel",
  aiRace: "AI Race",
  retirement: "Retirement",
  health: "Health",
  macro: "Macro",
  weather: "Weather",
  events: "Events",
  localHeadlines: "Local Headlines",
  usHeadlines: "US Headlines",
  worldHeadlines: "World Headlines",
  interesting: "Interesting",
};

// Renders a list of headline objects: { headline, source, whyItMatters }
function HeadlineList({ items }: { items: unknown[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const h = item as Record<string, string>;
        return (
          <div key={i} className="border-l-2 border-slate-200 pl-3">
            <p className="text-sm font-medium text-slate-800">{h.headline}</p>
            {h.source && (
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-medium">Source:</span> {h.source}
              </p>
            )}
            {h.whyItMatters && (
              <p className="text-xs text-indigo-600 mt-0.5 italic">{h.whyItMatters}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Renders a list of event objects: { title, area, location, timing, cost, whyGo }
function EventList({ items }: { items: unknown[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const e = item as Record<string, string>;
        return (
          <div key={i} className="rounded-md border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-800">{e.title}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {e.area && <Badge variant="outline" className="text-[10px]">{e.area}</Badge>}
              {e.timing && <span className="text-xs text-slate-400">{e.timing}</span>}
              {e.cost && <span className="text-xs text-emerald-600">{e.cost}</span>}
            </div>
            {e.location && <p className="text-xs text-slate-400 mt-1">{e.location}</p>}
            {e.whyGo && <p className="text-xs text-slate-600 mt-1 italic">{e.whyGo}</p>}
          </div>
        );
      })}
    </div>
  );
}

// Renders the bitcoin section
function BitcoinSection({ data }: { data: Record<string, unknown> }) {
  const price = data.price as number | undefined;
  const change = data.change24h as number | undefined;
  const dominance = data.dominance as number | undefined;
  const fearGreed = data.fearGreed as Record<string, unknown> | undefined;
  const headlines = data.headlines as unknown[] | undefined;
  const etfFlows = data.etfFlows as unknown[] | undefined;

  return (
    <div className="space-y-4">
      {price !== undefined && (
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-2xl font-bold text-slate-900">
            ${price.toLocaleString()}
          </span>
          {change !== undefined && (
            <span className={`text-sm font-mono ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </span>
          )}
          {dominance !== undefined && (
            <span className="text-xs text-slate-400">Dom: {dominance}%</span>
          )}
        </div>
      )}
      {fearGreed && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Fear &amp; Greed:</span>
          <Badge variant="outline" className={`text-xs ${
            (fearGreed.value as number) < 25 ? "text-rose-600 border-rose-200" :
            (fearGreed.value as number) < 50 ? "text-amber-600 border-amber-200" :
            "text-emerald-600 border-emerald-200"
          }`}>
            {fearGreed.value as number} — {fearGreed.label as string}
          </Badge>
        </div>
      )}
      {etfFlows && etfFlows.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">ETF Flows</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(etfFlows as Array<Record<string, unknown>>).map((etf, i) => (
              <div key={i} className="rounded-md border border-slate-100 p-2 text-center">
                <p className="font-mono text-xs font-bold text-slate-800">{etf.ticker as string}</p>
                <p className="text-[10px] text-slate-400">{etf.issuer as string}</p>
                <p className={`font-mono text-xs mt-1 ${(etf.flowM as number) > 0 ? "text-emerald-600" : (etf.flowM as number) < 0 ? "text-rose-600" : "text-slate-400"}`}>
                  {(etf.flowM as number) > 0 ? "+" : ""}{(etf.flowM as number).toFixed(2)}M
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {headlines && headlines.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Headlines</p>
          <HeadlineList items={headlines} />
        </div>
      )}
      {Boolean(data.summary) && (
        <p className="text-sm text-slate-600">{String(data.summary)}</p>
      )}
    </div>
  );
}

// Weather section renderer
function WeatherSection({ data }: { data: Record<string, unknown> }) {
  const locations = Object.entries(data);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {locations.map(([loc, info]) => {
        const w = info as Record<string, unknown>;
        return (
          <div key={loc} className="rounded-md border border-slate-100 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 capitalize">{loc}</p>
            <p className="font-mono text-2xl font-bold text-slate-800">{w.tempF as number}°F</p>
            <p className="text-sm text-slate-600">{w.condition as string}</p>
            <div className="flex gap-3 mt-1 text-xs text-slate-400">
              <span>H: {w.highF as number}°</span>
              <span>L: {w.lowF as number}°</span>
              {w.rainChancePct !== undefined && <span>Rain: {w.rainChancePct as number}%</span>}
            </div>
            {Boolean(w.practicalNote) && (
              <p className="text-xs text-indigo-600 italic mt-1">{String(w.practicalNote)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Generic fallback: renders as formatted JSON
function GenericSection({ data }: { data: unknown }) {
  if (Array.isArray(data)) {
    // Check if it looks like headlines
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && ("headline" in first || "title" in first)) {
      return <HeadlineList items={data} />;
    }
    if (first && "title" in first && "whyGo" in first) {
      return <EventList items={data} />;
    }
  }
  return (
    <pre className="whitespace-pre-wrap text-xs text-slate-600 font-mono overflow-auto bg-slate-50 rounded-md p-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function SectionRenderer({ sectionKey, data }: { sectionKey: string; data: unknown }) {
  if (sectionKey === "bitcoin" && typeof data === "object" && data !== null && !Array.isArray(data)) {
    return <BitcoinSection data={data as Record<string, unknown>} />;
  }
  if (sectionKey === "weather" && typeof data === "object" && data !== null && !Array.isArray(data)) {
    return <WeatherSection data={data as Record<string, unknown>} />;
  }
  if (sectionKey === "events" && Array.isArray(data)) {
    return <EventList items={data} />;
  }
  if (
    (sectionKey === "marketHeadlines" || sectionKey === "localHeadlines" || sectionKey === "usHeadlines" || sectionKey === "worldHeadlines") &&
    Array.isArray(data)
  ) {
    return <HeadlineList items={data} />;
  }
  if (sectionKey === "interesting" && typeof data === "object" && data !== null && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    return (
      <div>
        {Boolean(d.title) && <p className="font-semibold text-slate-800 mb-2">{String(d.title)}</p>}
        {Boolean(d.content) && <p className="text-sm text-slate-600">{String(d.content)}</p>}
      </div>
    );
  }
  return <GenericSection data={data} />;
}

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const briefing = getBriefingByDate(date);
  if (!briefing) return notFound();

  const isWeekend = briefing.edition === "weekend-life-briefing";
  const sections = (briefing.sections as Record<string, unknown>) || {};
  const generatedAt = briefing.generatedAt as string | undefined;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl">
      {/* Back */}
      <Link
        href="/brain"
        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
      >
        <ChevronLeft className="h-3 w-3" />
        2Brain Intelligence
      </Link>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-slate-900">
            {briefing.weekday as string}, {briefing.date as string}
          </h1>
          {isWeekend ? (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
              Weekend Life
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500">Daily</Badge>
          )}
          <Badge variant="outline" className="text-slate-400 text-xs">
            {briefing.confidence as string} confidence
          </Badge>
          <span className="text-xs text-slate-400">
            {briefing.sourcesCount as number} sources
          </span>
        </div>
        {generatedAt && (
          <p className="text-xs text-slate-400 font-mono">
            Generated {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Sections */}
      {Object.entries(sections).map(([key, value]) => (
        <Card key={key} className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              {SECTION_LABELS[key] ?? key}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SectionRenderer sectionKey={key} data={value} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
