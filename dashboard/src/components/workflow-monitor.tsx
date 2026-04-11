"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircuitBoard, Clock, Calendar } from "lucide-react";

interface Workflow {
  name: string;
  schedule: string;
  status: string;
  lastRun: string | null;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  pending_approval: "bg-amber-500/10 text-amber-400",
  paused: "bg-zinc-500/10 text-zinc-400",
  error: "bg-rose-500/10 text-rose-400",
};

export function WorkflowMonitor({ workflows }: { workflows: Workflow[] }) {
  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CircuitBoard className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Workflows
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workflows.map((wf, i) => (
          <motion.div
            key={wf.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
            className="rounded-md bg-white/[0.03] border border-white/[0.06] p-3"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-zinc-200">{wf.name}</p>
              <Badge
                variant="secondary"
                className={`text-[10px] ${statusColors[wf.status] || statusColors.paused}`}
              >
                {wf.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {wf.schedule}
              </span>
              {wf.lastRun && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {wf.lastRun}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
