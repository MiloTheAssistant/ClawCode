"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, FileText, Newspaper, FolderOpen } from "lucide-react";

interface BrainData {
  wikiArticles: number;
  rawSources: number;
  briefings: number;
  lastWikiUpdate: string | null;
  lastBriefing: string | null;
}

export function BrainStats({ data }: { data: BrainData }) {
  const stats = [
    { label: "Wiki Articles", value: data.wikiArticles, icon: FileText },
    { label: "Raw Sources", value: data.rawSources, icon: FolderOpen },
    { label: "Briefings", value: data.briefings, icon: Newspaper },
  ];

  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            2Brain
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
              className="text-center"
            >
              <stat.icon className="h-3.5 w-3.5 text-zinc-500 mx-auto mb-1" />
              <p className="text-lg font-mono text-zinc-100">{stat.value}</p>
              <p className="text-[10px] text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="space-y-1 text-[10px]">
          {data.lastBriefing && (
            <p className="text-zinc-500">
              Last briefing:{" "}
              <span className="font-mono text-zinc-400">
                {data.lastBriefing.slice(0, 10)}
              </span>
            </p>
          )}
          {data.lastWikiUpdate && (
            <p className="text-zinc-500">
              Wiki updated:{" "}
              <span className="font-mono text-zinc-400">
                {new Date(data.lastWikiUpdate).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
