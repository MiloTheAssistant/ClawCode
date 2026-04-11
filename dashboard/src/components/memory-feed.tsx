"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Search, PenLine, Eye, Sparkles } from "lucide-react";

interface MemoryOp {
  timestamp: string;
  agent: string;
  operation: string;
  query: string | null;
  result_count: number | null;
  content_preview: string | null;
}

const opIcons: Record<string, typeof Search> = {
  search: Search,
  write: PenLine,
  read: Eye,
  embed: Sparkles,
};

const opColors: Record<string, string> = {
  search: "text-blue-400",
  write: "text-amber-400",
  read: "text-emerald-400",
  embed: "text-purple-400",
};

export function MemoryFeed({ ops }: { ops: MemoryOp[] }) {
  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Memory Ops
          </CardTitle>
          <Badge variant="secondary" className="ml-auto text-[10px] bg-white/[0.06] text-zinc-400">
            {ops.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {ops.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-500 font-mono">
              No memory operations yet
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Ops appear as agents read/write memory
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {ops.map((op, i) => {
                const Icon = opIcons[op.operation] || Eye;
                return (
                  <motion.div
                    key={`${op.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="flex items-start gap-2 text-[11px] py-1.5 border-b border-white/[0.04] last:border-0"
                  >
                    <Icon
                      className={`h-3 w-3 mt-0.5 shrink-0 ${opColors[op.operation] || "text-zinc-500"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-zinc-300">
                          {op.agent}
                        </span>
                        <span className="text-zinc-500">{op.operation}</span>
                        <span className="text-zinc-500 font-mono ml-auto shrink-0">
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {op.query && (
                        <p className="text-zinc-500 truncate mt-0.5">
                          {op.query}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
