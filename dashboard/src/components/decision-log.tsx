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
import { Shield } from "lucide-react";

interface Decision {
  id: string;
  date: string;
  decision: string;
  made_by: string;
  context: string;
}

export function DecisionLog({ decisions }: { decisions: Decision[] }) {
  return (
    <Card className="bg-[#232442]/60 border-white/[0.06]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Decision Log
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2.5">
            {decisions.map((d, i) => (
              <motion.div
                key={d.id || i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                className="rounded-md bg-white/[0.03] border border-white/[0.06] p-2.5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono"
                  >
                    {d.id}
                  </Badge>
                  <span className="text-[10px] text-zinc-500">{d.made_by}</span>
                  {d.date && d.date !== "\u2014" && (
                    <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                      {d.date}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  {d.decision}
                </p>
                {d.context && d.context !== "\u2014" && (
                  <p className="text-[10px] text-zinc-500 mt-1">{d.context}</p>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
