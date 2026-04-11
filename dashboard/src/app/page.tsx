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
  const [gateway, ollama, runningModels, disk] = await Promise.all([
    getGatewayHealth(),
    getOllamaStatus(),
    getRunningModels(),
    Promise.resolve(getDiskSpace()),
  ]);

  const agents = getAgentRoster();
  const costData = queryRecentCostsByAgent() as { agent: string; total_cost: number; total_tokens: number }[];
  const memoryOps = queryMemoryOps(50) as {
    timestamp: string;
    agent: string;
    operation: string;
    query: string | null;
    result_count: number | null;
    content_preview: string | null;
  }[];
  const decisions = getDecisionLog();
  const brainStats = getBrainStats();
  const workflows = getWorkflows();
  const channels = getChannels();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-3.5 flex items-center gap-3 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <Activity className="h-5 w-5 text-indigo-500" />
        <h1 className="text-base font-semibold tracking-tight font-[family-name:var(--font-geist-sans)]">
          Command Center
        </h1>
        <Badge
          variant="outline"
          className="text-[10px] text-zinc-500 border-zinc-800"
        >
          OpenClaw v2026.4
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`h-1.5 w-1.5 rounded-full ${gateway.ok ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          <span className="text-[10px] font-mono text-zinc-500">
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
      <footer className="border-t border-zinc-800/40 px-6 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 font-mono">
          Command Center Dashboard — Kairo
        </span>
        <span className="text-[10px] text-zinc-700 font-mono">
          GOTCHA Framework · {new Date().toLocaleDateString()}
        </span>
      </footer>
    </div>
  );
}
