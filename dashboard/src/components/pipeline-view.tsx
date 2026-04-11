"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface PipelineAgent {
  name: string;
  status: "idle" | "active" | "done" | "error";
}

const PIPELINE_STAGES: PipelineAgent[] = [
  { name: "Cortana", status: "done" },
  { name: "Pulse", status: "done" },
  { name: "Sagan", status: "idle" },
  { name: "Quant", status: "idle" },
  { name: "Hemingway", status: "idle" },
  { name: "Sentinel", status: "idle" },
  { name: "Milo", status: "idle" },
];

export function PipelineView() {
  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((agent, i) => (
            <div key={agent.name} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="flex flex-col items-center gap-2 min-w-[72px]"
              >
                <motion.div
                  animate={
                    agent.status === "active"
                      ? {
                          boxShadow: [
                            "0 0 0px rgba(99,102,241,0)",
                            "0 0 20px rgba(99,102,241,0.5)",
                            "0 0 0px rgba(99,102,241,0)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    agent.status === "active"
                      ? { repeat: Infinity, duration: 2 }
                      : {}
                  }
                  className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-mono border transition-colors ${
                    agent.status === "active"
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                      : agent.status === "done"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : agent.status === "error"
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                          : "bg-white/[0.05] border-white/[0.08] text-zinc-500"
                  }`}
                >
                  {agent.status === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : agent.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </motion.div>
                <span
                  className={`text-[11px] font-mono ${
                    agent.status === "active"
                      ? "text-indigo-400"
                      : agent.status === "done"
                        ? "text-emerald-400/70"
                        : "text-zinc-500"
                  }`}
                >
                  {agent.name}
                </span>
              </motion.div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div
                  className={`w-6 h-px mx-1 ${
                    agent.status === "done"
                      ? "bg-emerald-500/30"
                      : "bg-white/[0.06]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
