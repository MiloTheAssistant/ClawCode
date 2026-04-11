"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Cpu, Radio, Database } from "lucide-react";

interface HealthData {
  gateway: { ok: boolean; status: string };
  ollama: { running: boolean; modelCount: number };
  runningModels: { name: string }[];
  disk: { totalGB: number; usedGB: number; availGB: number; usedPercent: number } | null;
}

export function SystemHealth({ data }: { data: HealthData }) {
  const items = [
    {
      label: "Gateway",
      icon: Radio,
      ok: data.gateway.ok,
      detail: data.gateway.status,
    },
    {
      label: "Ollama",
      icon: Cpu,
      ok: data.ollama.running,
      detail: `${data.ollama.modelCount} models`,
    },
    {
      label: "Active Models",
      icon: Database,
      ok: true,
      detail:
        data.runningModels.length > 0
          ? data.runningModels.map((m) => m.name).join(", ")
          : "None loaded",
    },
    {
      label: "4TB Drive",
      icon: HardDrive,
      ok: data.disk ? data.disk.usedPercent < 90 : false,
      detail: data.disk
        ? `${data.disk.usedGB}GB / ${data.disk.totalGB}GB (${data.disk.usedPercent}%)`
        : "Unknown",
    },
  ];

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            System Health
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="flex items-center gap-3"
          >
            <item.icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-300 w-24 shrink-0">
              {item.label}
            </span>
            <Badge
              variant="secondary"
              className={`text-[10px] ${
                item.ok
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {item.ok ? "OK" : "DOWN"}
            </Badge>
            <span className="text-[10px] font-mono text-zinc-500 truncate">
              {item.detail}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
