"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface CostEntry {
  agent: string;
  total_cost: number;
  total_tokens: number;
}

export function CostTracker({ data }: { data: CostEntry[] }) {
  const totalCost = data.reduce((s, d) => s + (d.total_cost || 0), 0);
  const totalTokens = data.reduce((s, d) => s + (d.total_tokens || 0), 0);
  const maxTokens = Math.max(...data.map((d) => d.total_tokens || 0), 1);

  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Cost Tracker
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-500 font-mono">
              No cost data yet
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Costs appear after agent API calls
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">
                  Total Cost
                </p>
                <p className="text-lg font-mono text-zinc-100">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase">Tokens</p>
                <p className="text-lg font-mono text-zinc-100">
                  {(totalTokens / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {data.slice(0, 8).map((entry, i) => (
                <motion.div
                  key={entry.agent}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{ transformOrigin: "left" }}
                >
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-zinc-400">{entry.agent}</span>
                    <span className="font-mono text-zinc-500">
                      ${(entry.total_cost || 0).toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400/70 rounded-full"
                      style={{
                        width: `${((entry.total_tokens || 0) / maxTokens) * 100}%`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
