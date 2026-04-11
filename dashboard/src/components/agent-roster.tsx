"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  model: string;
  provider: string;
  layer: "command" | "governance" | "specialist";
  color: string;
  status: "idle" | "active" | "error" | "exclusive";
}

const layerOrder = { command: 0, governance: 1, specialist: 2 };
const layerLabel = {
  command: "Command",
  governance: "Governance",
  specialist: "Specialist",
};

export function AgentRoster({ agents }: { agents: Agent[] }) {
  const sorted = [...agents].sort(
    (a, b) => layerOrder[a.layer] - layerOrder[b.layer]
  );

  const grouped = sorted.reduce(
    (acc, a) => {
      (acc[a.layer] ??= []).push(a);
      return acc;
    },
    {} as Record<string, Agent[]>
  );

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Agent Roster
          </CardTitle>
          <Badge variant="secondary" className="ml-auto text-[10px] bg-zinc-800 text-zinc-400">
            {agents.length} agents
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(["command", "governance", "specialist"] as const).map((layer) => (
          <div key={layer}>
            <p className="text-[10px] font-mono text-zinc-600 uppercase mb-2 tracking-widest">
              {layerLabel[layer]}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {(grouped[layer] ?? []).map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="flex items-center gap-2 rounded-md bg-zinc-800/40 px-2.5 py-2 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {agent.name}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate">
                      {agent.model}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
