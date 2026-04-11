import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { PipelineView } from "@/components/pipeline-view";
import { AgentRoster } from "@/components/agent-roster";
import { SystemHealth } from "@/components/system-health";
import { CostTracker } from "@/components/cost-tracker";
import { WorkflowMonitor } from "@/components/workflow-monitor";
import { BrainStats } from "@/components/brain-stats";
import { MemoryFeed } from "@/components/memory-feed";
import { DecisionLog } from "@/components/decision-log";
import { ChannelStatus } from "@/components/channel-status";

import { getGatewayHealth } from "@/lib/gateway";
import { getOllamaStatus, getRunningModels, getDiskSpace } from "@/lib/ollama";
import { queryCosts, queryMemoryOps, queryRecentCostsByAgent } from "@/lib/sqlite";
import { getDecisionLog, getActiveProjects, getBrainStats } from "@/lib/state";
import { getAgentRoster } from "@/lib/agents";
import { getWorkflows, getChannels } from "@/lib/workflows";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [gateway, ollama, runningModels] = await Promise.all([
    getGatewayHealth().catch(() => ({ ok: false, status: "unreachable" })),
    getOllamaStatus().catch(() => ({ running: false, modelCount: 0, models: [] })),
    getRunningModels().catch(() => []),
  ]);

  let disk = null;
  try { disk = getDiskSpace(); } catch { /* no-op on Vercel */ }

  let agents: ReturnType<typeof getAgentRoster> = [];
  try { agents = getAgentRoster(); } catch { /* no-op */ }

  let costData: { agent: string; total_cost: number; total_tokens: number }[] = [];
  try { costData = queryRecentCostsByAgent() as typeof costData; } catch { /* no-op */ }

  let memoryOps: {
    timestamp: string;
    agent: string;
    operation: string;
    query: string | null;
    result_count: number | null;
    content_preview: string | null;
  }[] = [];
  try { memoryOps = queryMemoryOps(50) as typeof memoryOps; } catch { /* no-op */ }

  let decisions: ReturnType<typeof getDecisionLog> = [];
  try { decisions = getDecisionLog(); } catch { /* no-op */ }

  const brainStats = (() => { try { return getBrainStats(); } catch { return { wikiArticles: 0, rawSources: 0, briefings: 0, lastWikiUpdate: null, lastBriefing: null }; } })();

  let workflows: ReturnType<typeof getWorkflows> = [];
  try { workflows = getWorkflows(); } catch { /* no-op */ }

  let channels: ReturnType<typeof getChannels> = [];
  try { channels = getChannels(); } catch { /* no-op */ }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-6 py-3.5 flex items-center gap-3 bg-[#1e1f35]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Activity className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white font-[family-name:var(--font-geist-sans)]">
            Command Center
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono -mt-0.5">OpenClaw GOTCHA Framework</p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-indigo-300/70 border-indigo-500/20 bg-indigo-500/5 ml-2"
        >
          v2026.4
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${gateway.ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.4)]"}`}
          />
          <span className="text-[11px] font-mono text-zinc-400">
            {gateway.ok ? "Gateway live" : "Gateway down"}
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Row 1: Pipeline (full width) */}
        <PipelineView />

        {/* Row 2: Agent Roster (wide) + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AgentRoster agents={agents} />
          </div>
          <SystemHealth
            data={{
              gateway,
              ollama,
              runningModels,
              disk,
            }}
          />
        </div>

        {/* Row 3: Cost + Workflows + 2Brain */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CostTracker data={costData} />
          <WorkflowMonitor workflows={workflows} />
          <BrainStats data={brainStats} />
        </div>

        {/* Row 4: Memory Ops + Decision Log + Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MemoryFeed ops={memoryOps} />
          <DecisionLog decisions={decisions} />
          <ChannelStatus channels={channels} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] px-6 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 font-mono">
          Kairo — Command Center Dashboard
        </span>
        <span className="text-[10px] text-zinc-600 font-mono">
          {new Date().toLocaleDateString()}
        </span>
      </footer>
    </div>
  );
}
